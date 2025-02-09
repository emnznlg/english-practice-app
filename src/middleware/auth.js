const { AppError } = require('./error');
const config = require('../config');
const { logError } = require('../config/logger');

const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return next(new AppError('API key is required', 401));
  }

  // TODO: API key validasyonu eklenecek
  // Şimdilik sadece varlık kontrolü yapıyoruz

  next();
};

const validateServices = (req, res, next) => {
  // OpenAI API key kontrolü
  if (!config.api.openai) {
    logError('OpenAI API key is missing');
    return next(new AppError('OpenAI service is not configured', 503));
  }

  // OpenRouter API key kontrolü
  if (!config.api.openrouter) {
    logError('OpenRouter API key is missing');
    return next(new AppError('OpenRouter service is not configured', 503));
  }

  next();
};

module.exports = {
  validateApiKey,
  validateServices
}; 