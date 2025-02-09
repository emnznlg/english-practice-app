# English Practice Chatbot - Backend

İngilizce pratik yapmak isteyenler için geliştirilmiş, yapay zeka destekli bir konuşma uygulamasının backend servisidir.

## 🚀 Özellikler

- 🤖 OpenRouter API ile gelişmiş AI sohbet deneyimi
- 🎙️ OpenAI Whisper ile ses tanıma
- 🔊 OpenAI TTS ile doğal ses sentezi
- 🔄 WebSocket ile gerçek zamanlı iletişim
- 📊 Konuşma analizi ve geri bildirim
- 💾 Ses önbellekleme
- 🌐 REST API endpoints
- 📝 Detaylı loglama sistemi

## 🛠️ Teknolojiler

- Node.js
- Express.js
- Socket.IO
- OpenAI SDK
- Winston Logger
- Node Cache

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- npm veya yarn
- OpenAI API anahtarı
- OpenRouter API anahtarı

## 🔧 Kurulum

1. Repo'yu klonlayın:
```bash
git clone [repo-url]
cd backend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
```

3. `.env` dosyasını oluşturun:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# API Keys
OPENAI_API_KEY=your_openai_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# Chat Configuration
CHAT_MODEL=google/gemini-2.0-flash-001
CHAT_FALLBACK_MODEL=openai/gpt-4

# WebSocket Configuration
WS_PORT=3001

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

4. Uygulamayı başlatın:
```bash
# Geliştirme modu
npm run dev

# Prodüksiyon modu
npm start
```

## 📁 Proje Yapısı

```
backend/
├── src/
│   ├── config/           # Konfigürasyon dosyaları
│   │   ├── index.js     # Ana config
│   │   └── logger.js    # Winston logger config
│   ├── middleware/      # Express middleware'leri
│   │   ├── auth.js      # Kimlik doğrulama
│   │   └── error.js     # Hata yönetimi
│   ├── routes/          # API route'ları
│   │   ├── chat.js      # Chat endpoints
│   │   ├── stt.js       # Speech-to-Text endpoints
│   │   ├── tts.js       # Text-to-Speech endpoints
│   │   └── topics.js    # Konu endpoints
│   ├── services/        # İş mantığı servisleri
│   │   ├── chat.js      # Chat servisi
│   │   ├── socket.js    # WebSocket yönetimi
│   │   ├── stt.js       # STT servisi
│   │   └── tts.js       # TTS servisi
│   └── app.js          # Ana uygulama dosyası
├── test/               # Test dosyaları
├── logs/              # Log dosyaları
└── docs/              # Dokümantasyon
```

## 📚 API Dokümantasyonu

Detaylı API dokümantasyonu için [API Documentation](../docs/api-documentation.md) dosyasına bakın.

## 🧪 Test

Test sayfasına erişmek için:
```
http://localhost:3000/test
```

## 🔒 Güvenlik

- CORS koruması
- Rate limiting
- API anahtarı validasyonu
- Dosya boyutu limitleri
- Güvenli hata yönetimi

## 📊 Loglama

Loglar `logs/` dizininde tutulur:
- `error.log`: Hata logları
- `combined.log`: Tüm loglar
- `exceptions.log`: Yakalanmamış hatalar

## ⚙️ Ortam Değişkenleri

| Değişken | Açıklama | Varsayılan |
|----------|-----------|------------|
| PORT | Sunucu portu | 3000 |
| NODE_ENV | Çalışma ortamı | development |
| OPENAI_API_KEY | OpenAI API anahtarı | - |
| OPENROUTER_API_KEY | OpenRouter API anahtarı | - |
| CHAT_MODEL | Varsayılan chat modeli | google/gemini-2.0-flash-001 |
| CHAT_FALLBACK_MODEL | Yedek chat modeli | openai/gpt-4 |
| FRONTEND_URL | Frontend URL'i | http://localhost:5173 |

## 🚦 Servis Durumu

Servis durumunu kontrol etmek için:
```
GET /api/health
```

## 🐛 Hata Ayıklama

1. WebSocket bağlantı sorunları:
   - CORS ayarlarını kontrol edin
   - Port numaralarını doğrulayın
   - Frontend URL'ini kontrol edin

2. API hataları:
   - API anahtarlarının doğruluğunu kontrol edin
   - İstek limitlerini kontrol edin
   - Log dosyalarını inceleyin

3. Ses sorunları:
   - Dosya formatını kontrol edin
   - Dosya boyutunu kontrol edin
   - Önbellek durumunu kontrol edin

## 📝 Lisans

MIT

## 👥 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit'leyin (`git commit -m 'feat: add amazing feature'`)
4. Push'layın (`git push origin feature/amazing-feature`)
5. Pull Request açın 