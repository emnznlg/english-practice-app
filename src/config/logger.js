const winston = require('winston');
const path = require('path');

// Log dizinini oluştur
const logDir = path.join(process.cwd(), 'logs');

// Log formatı
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Logger instance'ı oluştur
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Konsol çıktısı
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Production ortamında dosyaya da yaz
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error'
  }));
  
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'combined.log')
  }));
}

// Hata yakalama
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join('logs', 'exceptions.log')
  })
);

// Loglama yardımcı fonksiyonları
const logInfo = (message, meta = {}) => {
  logger.info(message, { ...meta, timestamp: new Date().toISOString() });
};

const logError = (message, error = null, meta = {}) => {
  logger.error(message, {
    ...meta,
    error: error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
};

const logDebug = (message, meta = {}) => {
  logger.debug(message, { ...meta, timestamp: new Date().toISOString() });
};

module.exports = {
  logger,
  logInfo,
  logError,
  logDebug
}; 