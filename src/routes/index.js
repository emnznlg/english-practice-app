const express = require('express');
const router = express.Router();

// Health check endpoint'i
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Alt route'ları import et
router.use('/chat', require('./chat'));
router.use('/tts', require('./tts'));
router.use('/stt', require('./stt'));
router.use('/topics', require('./topics'));

module.exports = router; 