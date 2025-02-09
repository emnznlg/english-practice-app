# Proje Yapısı ve Geliştirme Aşamaları

## 1. Temel Altyapı (Faz 1)
- Frontend ve backend projeleri kurulumu
- WebSocket altyapısının hazırlanması
- API anahtarlarının yönetimi
- Temel hata yönetimi
- Loglama sistemi

## 2. Konuşma Arayüzü (Faz 2)
- Konu seçim sayfası
- Chat arayüzü tasarımı
- Mesaj gönderme/alma mekanizması
- Yükleme animasyonları
- Hata mesajları

## 3. Ses Entegrasyonu (Faz 3)
- OpenAI TTS entegrasyonu
- Ses çalma kontrolü
- Ses önbelleğe alma
- Tekrar oynatma özelliği

## 4. Konuşma Tanıma (Faz 4)
- OpenAI Whisper entegrasyonu
- Mikrofon erişimi
- Ses kaydı ve gönderimi
- Gerçek zamanlı geri bildirim

## 5. AI Chat Entegrasyonu (Faz 5)
- OpenRouter API entegrasyonu
- Streaming yanıtlar
- Prompt yönetimi
- Model seçimi ve yedekleme

## 6. Analiz Sistemi (Faz 6)
- Konuşma analizi
- Kelime doğruluğu kontrolü
- Gramer kontrolü
- Analiz raporlama

## 7. Optimizasyon ve Test (Faz 7)
- Performans iyileştirmeleri
- Hata ayıklama
- Kullanıcı testleri
- Son düzenlemeler

# Detaylı Geliştirme Planı

## Faz 1: Temel Altyapı

### Backend (Node.js + Express)
```
/backend
├── src/
│   ├── config/           # Konfigürasyon dosyaları
│   ├── middleware/       # Express middleware'leri
│   ├── routes/          # API route'ları
│   ├── services/        # İş mantığı servisleri
│   ├── utils/           # Yardımcı fonksiyonlar
│   └── app.js           # Ana uygulama dosyası
```

### Frontend (Vite + React + TS)
```
/frontend
├── src/
│   ├── components/      # React bileşenleri
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API servisleri
│   ├── store/          # State yönetimi
│   ├── styles/         # Tailwind ve diğer stiller
│   ├── types/          # TypeScript tipleri
│   └── App.tsx         # Ana uygulama bileşeni
```

### WebSocket Yapısı
- Socket.IO kullanılacak
- Mesaj formatları:
```typescript
interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  messageId: string;
}

interface StreamChunk {
  messageId: string;
  content: string;
  isLast: boolean;
}
```

### API Anahtarları Yönetimi
- `.env` dosyaları kullanılacak
- Backend'de güvenli depolama
- Frontend'de environment variables

### Loglama Sistemi
- Winston logger kullanılacak
- Hata ve performans logları
- Request/response logları

## Başlangıç Adımları

1. Backend projesini oluşturma
2. Frontend projesini oluşturma
3. WebSocket bağlantısını kurma
4. Temel API route'larını oluşturma
5. Loglama sistemini kurma

Her faz için benzer detaylı dokümantasyon oluşturulacak ve geliştirme sırasında güncellenecek. 