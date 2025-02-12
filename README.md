# English Practice Chatbot - Backend

İngilizce pratik yapmak isteyenler için geliştirilmiş, yapay zeka destekli bir konuşma uygulamasının backend servisidir.

## 🚀 Özellikler

### Temel Özellikler

- 🎭 İki farklı mod: Sohbet ve Roleplay
- 🎯 Kullanıcı seviyesine göre uyarlanmış konuşmalar (Başlangıç, Orta, İleri)
- 🔄 WebSocket ile gerçek zamanlı iletişim
- 📊 Detaylı konuşma analizi ve geri bildirim
- 🌓 Koyu/Açık tema desteği
- 📱 Mobil uyumlu tasarım

### Sohbet Modu Özellikleri

- 🗣️ 10 farklı ilgi çekici konuda sohbet imkanı:
  - En Sevdiğin Diziler ve Film Karakterleri
  - Hayalindeki Tatil Yeri
  - Çocukluk Anıları
  - Gelecekteki Hedefler ve Hayaller
  - En Sevdiğin Yemekler ve Mutfaklar
  - Evcil Hayvanlar ve Hayvan Sevgisi
  - Komik Deneyimler ve Anılar
  - Aile ve Arkadaşlık İlişkileri
  - İlginç Hobiler ve Yeni Şeyler Öğrenme
  - Sosyal Medya ve İnternet Alışkanlıkları

### Roleplay Modu Özellikleri

- 👥 12 farklı karakter ile pratik yapma imkanı:
  - Taksi Şoförü
  - Market Kasiyeri
  - Banka Memuru
  - Restoran Garsonu
  - Otel Resepsiyonisti
  - Doktor
  - Kütüphaneci
  - Fitness Eğitmeni
  - Seyahat Acentesi
  - Bilgisayar Teknisyeni
  - Emlakçı
  - Öğretmen

### Ses Özellikleri

- 🎙️ OpenAI Whisper ile ses tanıma
- 🔊 OpenAI TTS ile doğal ses sentezi
- 🔁 Ses mesajlarını tekrar oynatma
- 💾 Ses önbellekleme
- ⏱️ Ses kuyruğu yönetimi

### AI Özellikleri

- 🤖 OpenRouter API ile gelişmiş AI sohbet deneyimi
- 📝 Kullanıcı seviyesine uygun yanıtlar
- 🔄 Streaming yanıtlar
- 🎯 Doğal konuşma akışı
- 📊 Türkçe konuşma analizi ve geri bildirim

### Kullanıcı Deneyimi

- ⌛ Yükleme animasyonları
- 🔄 Gerçek zamanlı durum göstergeleri
- 🎯 Sezgisel arayüz
- 📱 Responsive tasarım
- 🌈 Tema desteği

## 🛠️ Teknolojiler

### Backend

- Node.js
- Express.js
- Socket.IO
- OpenAI SDK
- Winston Logger
- Node Cache

### Frontend

- Vite
- React
- TypeScript
- Tailwind CSS
- Socket.IO Client
- Bootstrap 5

### Servisler

- OpenRouter API (Chat)
- OpenAI Whisper API (STT)
- OpenAI TTS API (TTS)

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
│   │   ├── prompts.js   # AI promptları
│   │   └── logger.js    # Winston logger config
│   ├── middleware/      # Express middleware'leri
│   │   ├── auth.js      # Kimlik doğrulama
│   │   └── error.js     # Hata yönetimi
│   ├── routes/          # API route'ları
│   │   ├── chat.js      # Chat endpoints
│   │   ├── stt.js       # Speech-to-Text endpoints
│   │   └── tts.js       # Text-to-Speech endpoints
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

## 🚀 Deployment

Uygulama Render üzerinde deploy edilebilir:

1. Render hesabı oluşturun
2. GitHub reposunu bağlayın
3. Web servisi oluşturun:
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`
   - Environment variables ayarlayın

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
