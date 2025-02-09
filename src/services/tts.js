const OpenAI = require('openai');
const NodeCache = require('node-cache');
const { logInfo, logError } = require('../config/logger');
const config = require('../config');
const { AppError } = require('../middleware/error');

// 1 saatlik önbellek süresi
const audioCache = new NodeCache({ stdTTL: 3600 });

class TTSService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.api.openai
    });
  }

  /**
   * Metni sese çevirir
   * @param {string} text - Sese çevrilecek metin
   * @returns {Promise<{audioContent: Buffer, audioId: string}>}
   */
  async textToSpeech(text) {
    try {
      // Metin uzunluğu kontrolü
      if (text.length > 4096) {
        throw new AppError('Text is too long. Maximum 4096 characters allowed.', 400);
      }

      // Önbellekte var mı kontrol et
      const cacheKey = this._generateCacheKey(text);
      const cachedAudio = audioCache.get(cacheKey);
      
      if (cachedAudio) {
        logInfo('Audio retrieved from cache', { cacheKey });
        return {
          audioContent: cachedAudio,
          audioId: cacheKey
        };
      }

      // OpenAI TTS API'sini çağır
      const response = await this.openai.audio.speech.create({
        model: config.tts.model,
        voice: config.tts.voice,
        input: text,
        response_format: 'mp3',
        speed: 1.0
      });

      // Buffer'a çevir
      const buffer = Buffer.from(await response.arrayBuffer());

      // Önbelleğe kaydet
      audioCache.set(cacheKey, buffer);

      logInfo('Text converted to speech', { 
        textLength: text.length,
        audioSize: buffer.length,
        cacheKey 
      });

      return {
        audioContent: buffer,
        audioId: cacheKey
      };
    } catch (error) {
      logError('TTS error', error);
      throw error;
    }
  }

  /**
   * Önbellekten ses dosyasını getirir
   * @param {string} audioId - Ses dosyası ID'si
   * @returns {Promise<Buffer>}
   */
  async getAudioFromCache(audioId) {
    const audio = audioCache.get(audioId);
    
    if (!audio) {
      throw new AppError('Audio not found in cache', 404);
    }

    logInfo('Audio retrieved from cache', { audioId });
    return audio;
  }

  /**
   * Önbellek anahtarı oluşturur
   * @private
   * @param {string} text - Sese çevrilecek metin
   * @returns {string}
   */
  _generateCacheKey(text) {
    // Basit bir hash fonksiyonu
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `tts_${hash}`;
  }
}

module.exports = new TTSService(); 