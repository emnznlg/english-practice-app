const socketIO = require('socket.io');
const { logInfo, logError } = require('../config/logger');
const chatService = require('./chat');
const ttsService = require('./tts');

class SocketService {
  constructor() {
    this.io = null;
    this.activeSessions = new Set();
    this.messageBuffers = new Map(); // Her oturum için mesaj buffer'ı
  }

  /**
   * Socket.IO sunucusunu başlatır
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', this._handleConnection.bind(this));

    logInfo('WebSocket server initialized');
  }

  /**
   * Yeni bağlantıyı yönetir
   * @private
   * @param {Object} socket - Socket instance
   */
  _handleConnection(socket) {
    logInfo('Client connected', { socketId: socket.id });

    // Chat oturumu başlat
    socket.on('chat:start', async (data) => {
      try {
        const { topic } = data;
        const sessionId = socket.id;

        // Chat oturumunu başlat
        const initialMessage = await chatService.startSession(sessionId, topic);
        this.activeSessions.add(sessionId);
        this.messageBuffers.set(sessionId, ''); // Buffer'ı başlat

        // Mesajı TTS ile sese çevir
        const { audioContent, audioId } = await ttsService.textToSpeech(initialMessage);

        // İlk mesajı ve sesi gönder
        socket.emit('chat:audio', {
          audioId,
          audioContent: audioContent.toString('base64'),
          message: initialMessage,
          isFirstSentence: true,
          isComplete: true,
          timestamp: Date.now()
        });

        logInfo('Chat session started', { sessionId, topic });
      } catch (error) {
        logError('Failed to start chat', error);
        socket.emit('chat:error', {
          message: 'Failed to start chat session'
        });
      }
    });

    // Kullanıcı mesajını işle
    socket.on('chat:message', async (data) => {
      try {
        const { message } = data;
        const sessionId = socket.id;

        if (!this.activeSessions.has(sessionId)) {
          throw new Error('No active session found. Please start a chat first.');
        }

        // Buffer'ı sıfırla
        this.messageBuffers.set(sessionId, '');

        // Kullanıcı mesajını kaydet
        socket.emit('chat:message', {
          type: 'user',
          content: message,
          timestamp: Date.now()
        });

        // Mesajı işle ve streaming yanıt al
        await chatService.processMessage(sessionId, message, async (chunk) => {
          // Buffer'a ekle
          const currentBuffer = this.messageBuffers.get(sessionId) + chunk;
          this.messageBuffers.set(sessionId, currentBuffer);
        });

        // Mesaj tamamlandı
        const completeMessage = this.messageBuffers.get(sessionId);
        
        // İlk cümleyi bul
        const firstSentenceMatch = completeMessage.match(/^[^.!?]+[.!?]/);
        if (!firstSentenceMatch) {
          // Eğer cümle bulunamazsa tüm mesajı tek parça olarak işle
          const { audioContent, audioId } = await ttsService.textToSpeech(completeMessage);
          socket.emit('chat:audio', {
            audioId,
            audioContent: audioContent.toString('base64'),
            message: completeMessage,
            isFirstSentence: true,
            isComplete: true,
            timestamp: Date.now()
          });
        } else {
          // İlk cümleyi ve geri kalanı ayır
          const firstSentence = firstSentenceMatch[0];
          const remainingText = completeMessage.slice(firstSentence.length).trim();

          // İlk cümleyi TTS'e gönder
          const { audioContent: firstAudioContent, audioId: firstAudioId } = await ttsService.textToSpeech(firstSentence);
          
          // İlk cümleyi gönder
          socket.emit('chat:audio', {
            audioId: firstAudioId,
            audioContent: firstAudioContent.toString('base64'),
            message: firstSentence,
            isFirstSentence: true,
            isComplete: false,
            completeMessage, // Tam mesajı da gönder
            timestamp: Date.now(),
            hasNext: !!remainingText // Sonraki parça var mı?
          });

          if (remainingText) {
            // Geri kalanı TTS'e gönder
            const { audioContent: remainingAudioContent, audioId: remainingAudioId } = await ttsService.textToSpeech(remainingText);
            
            // Geri kalanı gönder (ikinci parça)
            socket.emit('chat:audio', {
              audioId: remainingAudioId,
              audioContent: remainingAudioContent.toString('base64'),
              message: remainingText,
              isFirstSentence: false,
              isComplete: true,
              completeMessage,
              timestamp: Date.now(),
              hasNext: false
            });
          }
        }

        // Mesaj tamamlandı
        socket.emit('chat:complete');

        logInfo('Message processed', { 
          sessionId,
          messageLength: completeMessage.length 
        });
      } catch (error) {
        logError('Failed to process message', error);
        socket.emit('chat:error', {
          message: error.message || 'Failed to process message'
        });
      }
    });

    // Chat oturumunu sonlandır
    socket.on('chat:end', async () => {
      try {
        const sessionId = socket.id;

        if (!this.activeSessions.has(sessionId)) {
          throw new Error('No active session found');
        }

        // Oturumu sonlandır ve analiz al
        const analysis = await chatService.endSession(sessionId);
        
        // Temizlik
        this.activeSessions.delete(sessionId);
        this.messageBuffers.delete(sessionId);

        // Analizi gönder
        socket.emit('chat:analysis', analysis);

        logInfo('Chat session ended', { sessionId });
      } catch (error) {
        logError('Failed to end chat', error);
        socket.emit('chat:error', {
          message: error.message || 'Failed to end chat session'
        });
      }
    });

    // Bağlantı koptuğunda
    socket.on('disconnect', () => {
      const sessionId = socket.id;
      
      if (this.activeSessions.has(sessionId)) {
        try {
          chatService.endSession(sessionId);
          this.activeSessions.delete(sessionId);
          this.messageBuffers.delete(sessionId);
        } catch (error) {
          logError('Failed to cleanup session', error);
        }
      }

      logInfo('Client disconnected', { socketId: socket.id });
    });
  }

  /**
   * Belirli bir sokete mesaj gönderir
   * @param {string} socketId - Soket ID'si
   * @param {string} event - Event adı
   * @param {*} data - Gönderilecek veri
   */
  emit(socketId, event, data) {
    if (!this.io) return;
    this.io.to(socketId).emit(event, data);
  }

  /**
   * Tüm soketlere mesaj gönderir
   * @param {string} event - Event adı
   * @param {*} data - Gönderilecek veri
   */
  broadcast(event, data) {
    if (!this.io) return;
    this.io.emit(event, data);
  }
}

module.exports = new SocketService(); 