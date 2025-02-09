const express = require('express');
const router = express.Router();
const { validateServices } = require('../middleware/auth');
const { logInfo, logError } = require('../config/logger');
const { AppError } = require('../middleware/error');
const sttService = require('../services/stt');

// Ses'i text'e çevir
router.post('/convert', validateServices, async (req, res, next) => {
  try {
    // Ses dosyası kontrolü
    if (!req.files || !req.files.audio) {
      throw new AppError('Audio file is required', 400);
    }

    const audioFile = req.files.audio;
    const prompt = req.body.prompt || ''; // İsteğe bağlı prompt

    // Ses dosyasını buffer'a çevir
    const audioBuffer = audioFile.data;

    // STT servisini çağır
    const result = await sttService.speechToText(audioBuffer, {
      mimeType: audioFile.mimetype,
      prompt
    });

    res.json({
      status: 'success',
      data: {
        text: result.text,
        confidence: result.confidence,
        words: result.words
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 