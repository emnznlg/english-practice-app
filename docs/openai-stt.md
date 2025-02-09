# OpenAI Speech-to-Text (Whisper) API Dokümantasyonu

## 1. Genel Bakış
- Base URL: `https://api.openai.com/v1/audio`
- Whisper modeli kullanılarak ses dosyalarını metne çevirme
- Çoklu dil desteği
- Zaman damgası ve kelime bazlı bölümleme

## 2. Kimlik Doğrulama
- Bearer token authentication kullanılır
- Header'da kullanım: `Authorization: Bearer <OPENAI_API_KEY>`

## 3. Temel Endpointler
- `/transcriptions` - Ses dosyasını metne çevirme
- `/translations` - Ses dosyasını İngilizce'ye çevirme

## 4. Desteklenen Formatlar
- Ses Dosyası Formatları: mp3, mp4, mpeg, mpga, m4a, wav, webm
- Maksimum Dosya Boyutu: 25 MB

## 5. İstek Parametreleri

### 5.1 Transcriptions API
```typescript
{
  file: File, // Ses dosyası
  model: "whisper-1",
  language?: string, // ISO-639-1 format
  prompt?: string, // İsteğe bağlı bağlam bilgisi
  response_format?: "json" | "text" | "srt" | "verbose_json" | "vtt",
  temperature?: number, // 0-1 arası
  timestamp_granularities?: Array<"word" | "segment">
}
```

### 5.2 Translations API
```typescript
{
  file: File, // Ses dosyası
  model: "whisper-1",
  prompt?: string,
  response_format?: "json" | "text" | "srt" | "verbose_json" | "vtt",
  temperature?: number
}
```

## 6. Yanıt Formatları

### 6.1 JSON Format
```json
{
  "text": "Transkript metni burada..."
}
```

### 6.2 Verbose JSON Format
```json
{
  "task": "transcribe",
  "language": "tr",
  "duration": 2.95,
  "segments": [
    {
      "id": 0,
      "seek": 0,
      "start": 0.0,
      "end": 2.95,
      "text": " Segment metni burada...",
      "tokens": [50364, 2425, ...],
      "temperature": 0.0,
      "avg_logprob": -0.458,
      "compression_ratio": 1.275,
      "no_speech_prob": 0.0934,
      "words": [
        {
          "word": "Kelime",
          "start": 0.0,
          "end": 0.42,
          "probability": 0.98
        }
      ]
    }
  ]
}
```

## 7. Özellikler

### 7.1 Dil Desteği
- 100'den fazla dil için otomatik dil algılama
- İsteğe bağlı olarak belirli bir dil seçimi
- Tüm diller için İngilizce'ye çeviri

### 7.2 Zaman Damgaları
- Segment bazlı zaman damgaları
- Kelime bazlı zaman damgaları
- SRT ve VTT formatları için otomatik altyazı desteği

### 7.3 Prompt Kullanımı
- Bağlam bilgisi ile daha doğru transkript
- Özel terminoloji ve isimlerin doğru tanınması
- Dil modelinin yönlendirilmesi

## 8. Best Practices

### 8.1 Ses Kalitesi
- Temiz ve gürültüsüz kayıtlar kullanın
- Arka plan seslerini minimize edin
- Konuşmacı sesinin net olduğundan emin olun

### 8.2 Prompt Optimizasyonu
- İlgili bağlam bilgisini ekleyin
- Özel terimleri ve isimleri belirtin
- Dil ve aksanı belirtin

### 8.3 Performans İyileştirmeleri
- Büyük dosyaları bölümlere ayırın
- Uygun yanıt formatını seçin
- Gereksiz yüksek hassasiyet kullanmayın

## 9. Örnek Kullanım

### 9.1 Basit Transkripsiyon
```javascript
async function transcribeAudio(audioFile) {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');
  
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: formData
  });

  return response.json();
}
```

### 9.2 Gelişmiş Transkripsiyon
```javascript
async function transcribeWithOptions(audioFile, language, prompt) {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');
  formData.append('language', language);
  formData.append('prompt', prompt);
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities', '["word"]');
  
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: formData
  });

  return response.json();
}
```

## 10. Hata Kodları
- 400: Geçersiz istek (dosya formatı, boyut limiti vb.)
- 401: Geçersiz API anahtarı
- 429: Rate limit aşımı
- 500: Sunucu hatası

## 11. Maliyet
- Whisper API: $0.006 / dakika

## 12. Referanslar
- [OpenAI Whisper Dokümantasyonu](https://platform.openai.com/docs/guides/speech-to-text)
- [API Referansı](https://platform.openai.com/docs/api-reference/audio) 