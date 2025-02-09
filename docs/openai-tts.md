# OpenAI Text-to-Speech (TTS) API Dokümantasyonu

## 1. Genel Bakış
- Base URL: `https://api.openai.com/v1/audio`
- Metni doğal seslendirmeye çeviren API
- OpenAI'nin en yeni ses modelleri kullanılır
- Whisper modeli tabanlı dil desteği

## 2. Kimlik Doğrulama
- Bearer token authentication kullanılır
- Header'da kullanım: `Authorization: Bearer <OPENAI_API_KEY>`

## 3. Temel Endpointler
- `/speech` - Metin-ses dönüşümü için

## 4. İstek Formatı
```typescript
{
  model: "tts-1" | "tts-1-hd",
  input: string,
  voice: "alloy" | "ash" | "coral" | "echo" | "fable" | "onyx" | "nova" | "sage" | "shimmer",
  response_format?: "mp3" | "opus" | "aac" | "flac",
  speed?: number // 0.25 ile 4.0 arası
}
```

## 5. Önemli Özellikler

### 5.1 Ses Modelleri
- `tts-1`: Standart kalite
- `tts-1-hd`: Yüksek kalite (daha doğal ses ve daha az statik)

### 5.2 Ses Karakterleri
- `alloy`: Dengeli ve nötr
- `ash`: Profesyonel ve net
- `coral`: Sıcak ve davetkar
- `echo`: Daha olgun ve derin
- `fable`: Enerjik ve genç
- `onyx`: Güçlü ve otoriter
- `nova`: Yumuşak ve sıcak
- `sage`: Sakin ve düşünceli
- `shimmer`: Berrak ve parlak

### 5.3 Ses Formatları
- `mp3`: Varsayılan format (24kHz)
- `opus`: Düşük gecikme için optimize edilmiş
- `aac`: Yüksek verimlilik, mobil cihazlar için ideal
- `flac`: Kayıpsız sıkıştırma, profesyonel ses düzenleme için

### 5.4 Hız Kontrolü
- 0.25x ile 4.0x arası hız ayarı
- Varsayılan: 1.0

## 6. Limitler ve Kısıtlamalar
- Maksimum girdi uzunluğu: 4096 karakter
- Rate limiting: Dakikada 50 istek
- Dosya boyutu: Model ve uzunluğa göre değişir

## 7. Desteklenen Diller
API, Whisper modelinin desteklediği tüm dilleri destekler:
- Afrikaans, Arabic, Armenian, Azerbaijani, Belarusian, Bosnian, Bulgarian, Catalan, Chinese
- Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, Galician, German, Greek
- Hebrew, Hindi, Hungarian, Icelandic, Indonesian, Italian, Japanese, Kannada, Kazakh, Korean
- Latvian, Lithuanian, Macedonian, Malay, Marathi, Maori, Nepali, Norwegian, Persian, Polish
- Portuguese, Romanian, Russian, Serbian, Slovak, Slovenian, Spanish, Swahili, Swedish, Tagalog
- Tamil, Thai, Turkish, Ukrainian, Urdu, Vietnamese, Welsh

## 8. Best Practices

### 8.1 Model Seçimi
- Standart kullanım için `tts-1`
- Yüksek kalite gerektiğinde `tts-1-hd`
- HD model yaklaşık 2 kat daha pahalı

### 8.2 Ses Optimizasyonu
- Kısa metinler için önbellek kullanımı
- Uzun metinleri parçalara bölme
- Uygun ses formatı seçimi

### 8.3 Performans İyileştirmeleri
- Paralel istek yönetimi
- Önbellek stratejisi
- Hata durumu yönetimi

## 9. Örnek Kullanım

```javascript
async function generateSpeech(text) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'alloy',
      response_format: 'mp3'
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.blob();
}
```

## 10. Hata Kodları
- 400: Geçersiz istek (karakter limiti aşımı vb.)
- 401: Geçersiz API anahtarı
- 429: Rate limit aşımı
- 500: Sunucu hatası

## 11. Maliyet
- tts-1: $0.015 / 1K karakter
- tts-1-hd: $0.030 / 1K karakter

## 12. SSS

### Ses çıktısının duygusal aralığını kontrol edebilir miyim?
Şu anda doğrudan duygu kontrolü için bir mekanizma yok. Ancak farklı ses karakterleri ve hız ayarları ile çeşitli tonlar elde edilebilir.

### Kendi özel sesimi oluşturabilir miyim?
Hayır, şu anda bu özellik desteklenmiyor.

### Üretilen sesi ticari olarak kullanabilir miyim?
Evet, API'den üretilen tüm sesler sizindir ve ticari olarak kullanılabilir.

## 13. Referanslar
- [OpenAI TTS Dokümantasyonu](https://platform.openai.com/docs/guides/text-to-speech)
- [API Referansı](https://platform.openai.com/docs/api-reference/audio) 