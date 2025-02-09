const path = require('path');

// Varsayılan değerler
const defaults = {
  server: {
    port: 3000,
    env: 'development',
    frontendUrl: 'http://localhost:5173'
  },
  api: {
    openai: process.env.OPENAI_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY
  },
  chat: {
    defaultModel: 'google/gemini-2.0-flash-001',
    fallbackModel: 'openai/gpt-3.5-turbo-16k',
    maxTokens: 2000,
    temperature: 0.7
  },
  tts: {
    model: 'tts-1',
    voice: 'alloy',
    format: 'mp3'
  },
  stt: {
    model: 'whisper-1',
    language: 'en',
    responseFormat: 'verbose_json'
  }
};

// Environment variables'dan gelen değerleri varsayılan değerlerle birleştir
const config = {
  server: {
    port: process.env.PORT || defaults.server.port,
    env: process.env.NODE_ENV || defaults.server.env,
    frontendUrl: process.env.FRONTEND_URL || defaults.server.frontendUrl
  },
  api: {
    openai: process.env.OPENAI_API_KEY || defaults.api.openai,
    openrouter: process.env.OPENROUTER_API_KEY || defaults.api.openrouter
  },
  chat: {
    defaultModel: process.env.CHAT_MODEL || 'google/gemini-2.0-flash-001',
    fallbackModel: process.env.CHAT_FALLBACK_MODEL || 'openai/gpt-3.5-turbo-16k',
    maxTokens: 2000,
    temperature: 0.7
  },
  tts: { ...defaults.tts },
  stt: { ...defaults.stt }
};

// API key kontrolü
if (!config.api.openai) {
  console.warn('Warning: OPENAI_API_KEY is not set');
}

if (!config.api.openrouter) {
  console.warn('Warning: OPENROUTER_API_KEY is not set');
}

module.exports = config; 