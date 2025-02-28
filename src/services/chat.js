const OpenAI = require("openai");
const { logInfo, logError } = require("../config/logger");
const config = require("../config");
const prompts = require("../config/prompts");
const { AppError } = require("../middleware/error");

class ChatService {
  constructor() {
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: config.api.openrouter,
      defaultHeaders: {
        "HTTP-Referer": config.server.frontendUrl,
        "X-Title": "English Practice Chatbot",
      },
    });

    // Aktif oturumları sakla
    this.sessions = new Map();
  }

  /**
   * Chat oturumu başlatır
   * @param {string} sessionId - Oturum ID'si
   * @param {Object} options - Oturum seçenekleri
   * @param {string} options.mode - Mod ('chat' veya 'roleplay')
   * @param {string} options.topic - Seçilen konu (chat modu için)
   * @param {string} options.roleplayOption - Seçilen roleplay karakteri (roleplay modu için)
   * @param {string} options.level - İngilizce seviyesi
   * @returns {Promise<string>} - İlk mesaj
   */
  async startSession(sessionId, options) {
    try {
      const { mode, topic, roleplayOption, level } = options;

      // Oturum bilgilerini oluştur
      const session = {
        mode,
        topic,
        roleplayOption,
        level,
        messages: [],
        startTime: Date.now(),
        messageCount: 0,
      };

      // Moda göre başlangıç promptunu hazırla
      let systemPrompt;
      let initialAssistantMessage;

      if (mode === "roleplay") {
        systemPrompt = prompts.chat.roleplay(level, roleplayOption);
        initialAssistantMessage = `Hi! I'm your ${roleplayOption}. How can I help you today?`;
      } else {
        systemPrompt = prompts.chat.system(topic, level);
        initialAssistantMessage = "Let's start our conversation about " + topic;
      }

      // İlk mesajı al
      const response = await this.openai.chat.completions.create({
        model: config.chat.defaultModel,
        messages: [{ role: "system", content: systemPrompt }],
        stream: false,
        temperature: config.chat.temperature,
        max_tokens: 200,
        models: [config.chat.defaultModel, config.chat.fallbackModel],
      });

      const initialMessage = response.choices[0].message.content;

      // Oturum bilgilerini güncelle
      session.messages.push(
        { role: "system", content: systemPrompt },
        { role: "assistant", content: initialMessage }
      );
      session.messageCount++;

      // Oturumu kaydet
      this.sessions.set(sessionId, session);

      logInfo("Chat session started", {
        sessionId,
        mode,
        topic,
        roleplayOption,
        level,
        initialMessageLength: initialMessage.length,
      });

      return initialMessage;
    } catch (error) {
      logError("Failed to start chat session", error);
      throw new AppError("Failed to start chat session", 500);
    }
  }

  /**
   * Kullanıcı mesajını işler ve yanıt üretir
   * @param {string} sessionId - Oturum ID'si
   * @param {string} message - Kullanıcı mesajı
   * @param {function} onChunk - Chunk callback fonksiyonu
   * @returns {Promise<void>}
   */
  async processMessage(sessionId, message, onChunk) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new AppError("Session not found", 404);
      }

      // Mesajı oturuma ekle
      session.messages.push({ role: "user", content: message });
      session.messageCount++;

      // Streaming yanıt al
      const response = await this.openai.chat.completions.create({
        model: config.chat.defaultModel,
        messages: session.messages,
        stream: true,
        temperature: config.chat.temperature,
        max_tokens: config.chat.maxTokens,
        models: [config.chat.defaultModel, config.chat.fallbackModel],
        transforms: ["middle-out"], // 8k token üzeri için
      });

      let fullResponse = "";

      // Stream chunks
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          onChunk(content);
        }
      }

      // Yanıtı oturuma ekle
      session.messages.push({ role: "assistant", content: fullResponse });
      session.messageCount++;

      logInfo("Message processed", {
        sessionId,
        messageCount: session.messageCount,
        responseLength: fullResponse.length,
      });
    } catch (error) {
      logError("Failed to process message", error);
      throw new AppError("Failed to process message", 500);
    }
  }

  /**
   * Chat oturumunu sonlandırır ve analiz yapar
   * @param {string} sessionId - Oturum ID'si
   * @returns {Promise<Object>} - Oturum analizi
   */
  async endSession(sessionId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new AppError("Session not found", 404);
      }

      // Oturum süresini hesapla
      const duration = Date.now() - session.startTime;

      // Analiz için son prompt
      const analysisPrompt = {
        role: "system",
        content: prompts.chat.analysis(session.level),
      };

      // Analiz yap
      const response = await this.openai.chat.completions.create({
        model: config.chat.defaultModel,
        messages: [...session.messages, analysisPrompt],
        stream: false,
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" },
        models: [config.chat.defaultModel, config.chat.fallbackModel],
      });

      let analysis;
      try {
        // Yanıtı parse et
        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("API yanıtı boş geldi");
        }

        analysis = JSON.parse(content);
      } catch (parseError) {
        logError("Analiz parse hatası", parseError);
        // Varsayılan bir analiz döndür
        analysis = {
          overallScore: 70,
          feedback:
            "Üzgünüm, konuşma analizinde teknik bir sorun oluştu. Ancak konuşmanız genel olarak iyiydi. Pratik yapmaya devam etmenizi öneririm.",
        };
      }

      // Oturumu temizle
      this.sessions.delete(sessionId);

      logInfo("Session ended", {
        sessionId,
        duration,
        messageCount: session.messageCount,
        analysis,
      });

      return {
        duration,
        messageCount: session.messageCount,
        analysis,
      };
    } catch (error) {
      logError("Failed to end session", error);
      throw new AppError("Failed to end session", 500);
    }
  }
}

module.exports = new ChatService();
