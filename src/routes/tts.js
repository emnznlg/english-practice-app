const express = require('express');
const router = express.Router();
const { validateServices } = require('../middleware/auth');
const { logInfo, logError } = require('../config/logger');
const { AppError } = require('../middleware/error');
const ttsService = require('../services/tts');

// Text'i ses'e çevir
router.post('/convert', validateServices, async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      throw new AppError('Text is required', 400);
    }

    const { audioContent, audioId } = await ttsService.textToSpeech(text);

    // Audio buffer'ı gönder
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioContent.length,
      'X-Audio-ID': audioId
    });

    res.send(audioContent);
  } catch (error) {
    next(error);
  }
});

// Ses dosyasını yeniden oynat
router.get('/replay/:audioId', validateServices, async (req, res, next) => {
  try {
    const { audioId } = req.params;
    
    if (!audioId) {
      throw new AppError('Audio ID is required', 400);
    }

    const audioContent = await ttsService.getAudioFromCache(audioId);

    // Audio buffer'ı gönder
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioContent.length,
      'X-Audio-ID': audioId
    });

    res.send(audioContent);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 