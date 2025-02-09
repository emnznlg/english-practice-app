const OpenAI = require('openai');
const { logInfo, logError } = require('../config/logger');
const config = require('../config');
const { AppError } = require('../middleware/error');

class ChatService {
  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: config.api.openrouter,
      defaultHeaders: {
        'HTTP-Referer': config.server.frontendUrl,
        'X-Title': 'English Practice Chatbot'
      }
    });

    // Aktif oturumları sakla
    this.sessions = new Map();
  }

  /**
   * Chat oturumu başlatır
   * @param {string} sessionId - Oturum ID'si
   * @param {string} topic - Seçilen konu
   * @returns {Promise<string>} - İlk mesaj
   */
  async startSession(sessionId, topic) {
    try {
      // Oturum bilgilerini oluştur
      const session = {
        topic,
        messages: [],
        startTime: Date.now(),
        messageCount: 0
      };

      // Başlangıç promptunu hazırla
      const systemPrompt = this._generateSystemPrompt(topic);
      
      // İlk mesajı al
      const response = await this.openai.chat.completions.create({
        model: config.chat.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'assistant', content: 'Let\'s start our conversation about ' + topic }
        ],
        stream: false,
        temperature: config.chat.temperature,
        max_tokens: 200,
        // Yedek modeller
        models: [config.chat.defaultModel, config.chat.fallbackModel]
      });

      const initialMessage = response.choices[0].message.content;

      // Oturum bilgilerini güncelle
      session.messages.push(
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: initialMessage }
      );
      session.messageCount++;

      // Oturumu kaydet
      this.sessions.set(sessionId, session);

      logInfo('Chat session started', { 
        sessionId, 
        topic,
        initialMessageLength: initialMessage.length 
      });

      return initialMessage;
    } catch (error) {
      logError('Failed to start chat session', error);
      throw new AppError('Failed to start chat session', 500);
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
        throw new AppError('Session not found', 404);
      }

      // Mesajı oturuma ekle
      session.messages.push({ role: 'user', content: message });
      session.messageCount++;

      // Streaming yanıt al
      const response = await this.openai.chat.completions.create({
        model: config.chat.defaultModel,
        messages: session.messages,
        stream: true,
        temperature: config.chat.temperature,
        max_tokens: config.chat.maxTokens,
        models: [config.chat.defaultModel, config.chat.fallbackModel],
        transforms: ['middle-out'] // 8k token üzeri için
      });

      let fullResponse = '';

      // Stream chunks
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk(content);
        }
      }

      // Yanıtı oturuma ekle
      session.messages.push({ role: 'assistant', content: fullResponse });
      session.messageCount++;

      logInfo('Message processed', {
        sessionId,
        messageCount: session.messageCount,
        responseLength: fullResponse.length
      });
    } catch (error) {
      logError('Failed to process message', error);
      throw new AppError('Failed to process message', 500);
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
        throw new AppError('Session not found', 404);
      }

      // Oturum süresini hesapla
      const duration = Date.now() - session.startTime;

      // Analiz için son prompt
      const analysisPrompt = {
        role: 'system',
        content: `Please analyze the conversation and provide a JSON response with the following format:
        {
          "overallScore": number (0-100), // Genel performans puanı
          "feedback": string // Bir paragraf değerlendirme (Türkçe)
        }

        Değerlendirmede şunlara dikkat edin:
        - Konuşmanın doğal akışı
        - Kullanılan kelime ve cümlelerin doğruluğu ve akicilik
        - Alternatif kelime ve cumle onerileri


        Geri bildirim yapıcı ve motive edici olmalı, olumlu yönleri vurgulamalı ve varsa geliştirilmesi gereken noktaları nazikçe belirtmeli.`
      };

      // Analiz yap
      const response = await this.openai.chat.completions.create({
        model: config.chat.defaultModel,
        messages: [...session.messages, analysisPrompt],
        stream: false,
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
        models: [config.chat.defaultModel, config.chat.fallbackModel]
      });

      let analysis;
      try {
        // Yanıtı parse et
        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('API yanıtı boş geldi');
        }

        analysis = JSON.parse(content);

        // Gerekli alanları kontrol et
        if (!analysis.overallScore || !analysis.feedback) {
          throw new Error('Analiz sonucu eksik bilgi içeriyor');
        }

        // Puan aralığını kontrol et (0-100)
        analysis.overallScore = Math.min(100, Math.max(0, analysis.overallScore));
      } catch (parseError) {
        logError('Analiz parse hatası', parseError);
        // Varsayılan bir analiz döndür
        analysis = {
          overallScore: 70,
          feedback: "Üzgünüm, konuşma analizinde teknik bir sorun oluştu. Ancak konuşmanız genel olarak iyiydi. Pratik yapmaya devam etmenizi öneririm."
        };
      }

      // Oturumu temizle
      this.sessions.delete(sessionId);

      logInfo('Session ended', {
        sessionId,
        duration,
        messageCount: session.messageCount,
        analysis
      });

      return {
        duration,
        messageCount: session.messageCount,
        analysis
      };
    } catch (error) {
      logError('Failed to end session', error);
      throw new AppError('Failed to end session', 500);
    }
  }

  /**
   * Sistem promptu oluşturur
   * @private
   * @param {string} topic - Seçilen konu
   * @returns {string}
   */
  _generateSystemPrompt(topic) {
    return `You are an English conversation practice assistant. The topic is "${topic}".

Role and Objectives:
1. Help users practice English conversation naturally
2. Maintain a friendly and encouraging tone
3. Use clear and proper English suitable for the topic
4. Keep responses concise (2-3 sentences)
5s. Ask follow-up questions to maintain conversation flow

Guidelines:
1. Adapt language difficulty based on user responses
2. Focus on practical, real-world conversation
3. Encourage user to express thoughts fully
4. Provide gentle feedback when appropriate
5. Stay on topic but allow natural progression

Do not:
1. Switch to any language other than English
2. Provide direct translations
3. Give lengthy explanations about grammar
4. Interrupt user's flow of thought
5. Dont correct mistakes, just answer the questions and ask follow-up questions to maintain conversation flow
6. Dont start with "Thats awesome", "Thats good" etc. Use longer first sentences.

Begin the conversation in a friendly, engaging way related to the topic.`;
  }
}

module.exports = new ChatService(); 