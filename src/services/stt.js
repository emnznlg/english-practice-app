const OpenAI = require('openai');
const { logInfo, logError } = require('../config/logger');
const config = require('../config');
const { AppError } = require('../middleware/error');

class STTService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.api.openai
    });
  }

  /**
   * Ses dosyasını metne çevirir
   * @param {Buffer} audioBuffer - Ses dosyası buffer'ı
   * @param {Object} options - Çeviri seçenekleri
   * @param {string} options.mimeType - Dosya tipi
   * @param {string} options.prompt - İsteğe bağlı bağlam bilgisi
   * @returns {Promise<{text: string, confidence: number, words: Array}>}
   */
  async speechToText(audioBuffer, { mimeType, prompt = '' }) {
    try {
      // Dosya boyutu kontrolü (25MB)
      if (audioBuffer.length > 25 * 1024 * 1024) {
        throw new AppError('Audio file is too large. Maximum 25MB allowed.', 400);
      }

      // Dosya tipi kontrolü
      const allowedMimeTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm'];
      if (!allowedMimeTypes.includes(mimeType)) {
        throw new AppError('Invalid audio format. Allowed formats: WAV, MP3, WebM', 400);
      }

      // Dosya adı oluştur
      const timestamp = Date.now();
      const extension = mimeType.split('/')[1];
      const fileName = `speech_${timestamp}.${extension}`;

      // Dosyayı oluştur
      const file = new File([audioBuffer], fileName, { type: mimeType });

      logInfo('Converting speech to text', {
        fileSize: audioBuffer.length,
        mimeType,
        hasPrompt: !!prompt
      });

      // OpenAI Whisper API'sini çağır
      const response = await this.openai.audio.transcriptions.create({
        file,
        model: config.stt.model,
        language: 'en', // İngilizce için sabit
        prompt,
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      });

      // Sonuçları analiz et
      const result = {
        text: response.text,
        confidence: this._calculateConfidence(response),
        words: response.words.map(word => ({
          text: word.word,
          start: word.start,
          end: word.end,
          confidence: word.probability
        }))
      };

      logInfo('Speech converted to text', {
        textLength: result.text.length,
        wordCount: result.words.length,
        confidence: result.confidence
      });

      return result;
    } catch (error) {
      logError('STT error', error);
      throw error;
    }
  }

  /**
   * Konuşma doğruluk oranını hesaplar
   * @private
   * @param {Object} response - Whisper API yanıtı
   * @returns {number} - 0-1 arası doğruluk oranı
   */
  _calculateConfidence(response) {
    // Kelime bazlı olasılıkların ortalamasını al
    if (!response.words?.length) return 0;

    const totalConfidence = response.words.reduce((sum, word) => {
      return sum + (word.probability || 0);
    }, 0);

    return totalConfidence / response.words.length;
  }
}

module.exports = new STTService(); 