const OpenAI = require('openai');
const textToSpeech = require('@google-cloud/text-to-speech');
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

    this.googleTTS = new textToSpeech.TextToSpeechClient({
      apiKey: config.api.googleTTS
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

      let audioContent;
      const provider = config.tts.provider;

      if (provider === 'google') {
        audioContent = await this._googleTextToSpeech(text);
      } else {
        audioContent = await this._openaiTextToSpeech(text);
      }

      // Önbelleğe kaydet
      audioCache.set(cacheKey, audioContent);

      logInfo(`Text converted to speech using ${provider}`, { 
        textLength: text.length,
        audioSize: audioContent.length,
        cacheKey,
        provider
      });

      return {
        audioContent,
        audioId: cacheKey
      };
    } catch (error) {
      logError('TTS error', error);
      throw error;
    }
  }

  /**
   * OpenAI TTS ile metni sese çevirir
   * @private
   * @param {string} text - Sese çevrilecek metin
   * @returns {Promise<Buffer>}
   */
  async _openaiTextToSpeech(text) {
    const response = await this.openai.audio.speech.create({
      model: config.tts.openai.model,
      voice: config.tts.openai.voice,
      input: text,
      response_format: 'mp3',
      speed: 1.0
    });

    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * Google Cloud TTS ile metni sese çevirir
   * @private
   * @param {string} text - Sese çevrilecek metin
   * @returns {Promise<Buffer>}
   */
  async _googleTextToSpeech(text) {
    const request = {
      input: { text },
      voice: {
        languageCode: config.tts.google.languageCode,
        name: config.tts.google.voice
      },
      audioConfig: {
        audioEncoding: config.tts.google.audioEncoding,
        speakingRate: config.tts.google.speakingRate,
        pitch: config.tts.google.pitch
      }
    };

    const [response] = await this.googleTTS.synthesizeSpeech(request);
    return Buffer.from(response.audioContent);
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
    return `tts_${config.tts.provider}_${hash}`;
  }
}

module.exports = new TTSService(); 