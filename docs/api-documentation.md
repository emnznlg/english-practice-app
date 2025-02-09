# English Practice Chatbot API Dokümantasyonu

## Genel Bilgiler

- **Base URL**: `http://localhost:3000/api`
- **WebSocket URL**: `http://localhost:3000`
- **Content-Type**: `application/json`

## WebSocket Bağlantısı

### Bağlantı Kurulumu

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  autoConnect: true
});

// Bağlantı durumu dinleme
socket.on('connect', () => {
  console.log('Bağlantı kuruldu');
});

socket.on('disconnect', () => {
  console.log('Bağlantı kesildi');
});
```

### WebSocket Events

#### 1. Sohbet Başlatma

```javascript
// Event: chat:start
// Gönderilen veri
socket.emit('chat:start', { 
  topic: 'daily-life' 
});

// Yanıt dinleme
socket.on('chat:audio', (data) => {
  // data içeriği:
  // {
  //   audioId: string,          // Ses dosyası ID'si
  //   audioContent: string,     // Base64 formatında ses verisi
  //   message: string,          // AI'ın mesajı
  //   isFirstSentence: boolean, // İlk cümle mi?
  //   isComplete: boolean,      // Mesaj tamamlandı mı?
  //   timestamp: number,        // Zaman damgası
  //   hasNext: boolean         // Sonraki parça var mı?
  // }
});
```

#### 2. Mesaj Gönderme

```javascript
// Event: chat:message
// Gönderilen veri
socket.emit('chat:message', { 
  message: 'Hello, how are you?' 
});

// Yanıt dinleme (chunk'lar halinde gelir)
socket.on('chat:audio', (data) => {
  // Ses verisi ve mesaj işleme
  const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
  
  if (data.isFirstSentence) {
    // İlk cümleyi göster
    displayMessage(data.message);
    if (data.hasNext) {
      // Devamı gelecek, üç nokta ekle
      appendEllipsis();
    }
  } else {
    // Devam eden cümleyi göster
    updateMessage(data.message);
  }
  
  // Sesi çal
  audio.play();
});

// Mesaj tamamlandığında
socket.on('chat:complete', () => {
  // Mesaj tamamlandı işlemleri
});
```

#### 3. Sohbet Sonlandırma ve Analiz

```javascript
// Event: chat:end
socket.emit('chat:end');

// Analiz sonucunu dinleme
socket.on('chat:analysis', (data) => {
  // data içeriği:
  // {
  //   duration: number,        // Sohbet süresi (ms)
  //   messageCount: number,    // Toplam mesaj sayısı
  //   analysis: {
  //     overallScore: number, // Genel puan (0-100)
  //     feedback: string      // Türkçe geri bildirim
  //   }
  // }
});
```

## REST API Endpoints

### 1. Konular

#### Tüm Konuları Listele
- **Endpoint**: `GET /api/topics`
- **Yanıt**:
```javascript
{
  "status": "success",
  "data": [
    {
      "id": "daily-life",
      "title": "Daily Life",
      "description": "Practice conversations about daily activities",
      "difficulty": "beginner"
    },
    // ...diğer konular
  ]
}
```

#### Konu Detayı
- **Endpoint**: `GET /api/topics/:id`
- **Yanıt**:
```javascript
{
  "status": "success",
  "data": {
    "id": "daily-life",
    "title": "Daily Life",
    "description": "Practice conversations about daily activities",
    "difficulty": "beginner",
    "samplePrompts": [
      "Tell me about your day",
      "What are your plans for the weekend?"
    ]
  }
}
```

### 2. Ses-Metin Dönüşümü (STT)

#### Ses Dosyasını Metne Çevirme
- **Endpoint**: `POST /api/stt/convert`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `audio`: Ses dosyası (WAV, MP3, WebM)
  - `prompt`: (Opsiyonel) Bağlam bilgisi
- **Yanıt**:
```javascript
{
  "status": "success",
  "data": {
    "text": "Converted text from audio",
    "confidence": 0.95,
    "words": [
      {
        "text": "word",
        "start": 0.0,
        "end": 0.5,
        "confidence": 0.98
      }
    ]
  }
}
```

### 3. Metin-Ses Dönüşümü (TTS)

#### Metni Sese Çevirme
- **Endpoint**: `POST /api/tts/convert`
- **Body**:
```javascript
{
  "text": "Text to convert to speech"
}
```
- **Yanıt**: Audio buffer (audio/mpeg)
- **Headers**:
  - `Content-Type`: `audio/mpeg`
  - `X-Audio-ID`: Ses dosyası ID'si

#### Ses Tekrar Oynatma
- **Endpoint**: `GET /api/tts/replay/:audioId`
- **Yanıt**: Audio buffer (audio/mpeg)

## Hata Yönetimi

```javascript
// Hata yanıtı formatı
{
  "status": "error",
  "message": "Hata mesajı"
}

// WebSocket hata dinleme
socket.on('chat:error', (error) => {
  console.error('Hata:', error.message);
});
```

## Örnek Kullanım (React)

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function ChatComponent() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('chat:audio', handleAudioMessage);
    newSocket.on('chat:analysis', handleAnalysis);
    newSocket.on('chat:error', handleError);

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleAudioMessage = (data) => {
    // Mesajı göster
    if (data.isFirstSentence) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.message,
        type: 'assistant',
        audioId: data.audioId,
        hasNext: data.hasNext
      }]);
    } else {
      // Önceki mesajı güncelle
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, text: data.message, hasNext: false }
        ];
      });
    }

    // Sesi çal
    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
    audio.play();
  };

  const startChat = (topic) => {
    socket.emit('chat:start', { topic });
  };

  const sendMessage = (message) => {
    socket.emit('chat:message', { message });
  };

  const endChat = () => {
    socket.emit('chat:end');
  };

  return (
    <div>
      {/* UI bileşenleri */}
    </div>
  );
}
```

## Önemli Notlar

1. WebSocket bağlantısı koptuğunda otomatik yeniden bağlanma aktiftir
2. Ses dosyaları Base64 formatında gönderilir
3. Mesajlar chunk'lar halinde gelir ve sıralı oynatılır
4. Her ses mesajı için benzersiz bir `audioId` üretilir
5. Analiz sonuçları Türkçe olarak gelir

## Güvenlik

1. CORS ayarları yapılandırılmıştır
2. Rate limiting uygulanmıştır
3. Dosya boyutu limitleri:
   - Ses dosyaları: maksimum 25MB
   - Metin: maksimum 4096 karakter

## Ortam Değişkenleri

Frontend'de kullanılması gereken ortam değişkenleri:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
``` 