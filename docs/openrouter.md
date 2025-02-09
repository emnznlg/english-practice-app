# OpenRouter API Dokümantasyonu

## 1. Genel Bakış
- Base URL: `https://openrouter.ai/api/v1`
- OpenAI SDK veya direkt HTTP istekleri ile kullanılabilir
- OpenAI API'sine benzer bir yapı sunar
- 300'den fazla model desteği
- Multi-model ve multi-provider yaklaşımı

## 2. Kimlik Doğrulama
- Bearer token authentication kullanılır
- Header'da kullanım: `Authorization: Bearer <OPENROUTER_API_KEY>`
- İsteğe bağlı headerlar:
  - `HTTP-Referer`: Site URL'i (openrouter.ai sıralamaları için)
  - `X-Title`: Site başlığı (openrouter.ai sıralamaları için)

## 3. Temel Endpointler
- `/chat/completions` - Chat tamamlama için
- `/completions` - Metin tamamlama için
- `/models` - Mevcut modelleri listeleme
- `/generation` - Belirli bir generation'ın detayları
- `/credits` - Kredi bilgisi sorgulama

## 4. İstek Formatı
```typescript
{
  messages: [
    {
      role: "user" | "assistant",
      content: string | {
        type: "text" | "image_url",
        text?: string,
        image_url?: {
          url: string,
          detail?: string
        }
      }[]
    }
  ],
  model: string,
  stream?: boolean,
  temperature?: number,
  max_tokens?: number
}
```

## 5. Önemli Özellikler

### 5.1 Model Routing
- Auto Router: `openrouter/auto` ile otomatik model seçimi
- Fallback modeller ile yüksek erişilebilirlik
- Model listesi parametresi ile yedek model tanımlama
```typescript
{
  models: ["anthropic/claude-2.1", "gryphe/mythomist-7b"]
}
```

### 5.2 Provider Routing
- Farklı sağlayıcılar arasında otomatik geçiş
- Sağlayıcı önceliklendirme
- Rate limit ve downtime yönetimi

### 5.3 Prompt Caching
- OpenAI için:
  - Cache yazma: Ücretsiz
  - Cache okuma: Normal ücretlendirme
  - Minimum 1024 token prompt uzunluğu
- Anthropic Claude için:
  - Cache yazma: 1.25x normal ücret
  - Cache okuma: 0.5x normal ücret
  - Cache kontrolü için breakpoint sistemi

### 5.4 Message Transforms
- Uzun promptları otomatik sıkıştırma
- `middle-out` transform stratejisi
- 8k token üzeri promptlar için otomatik transform
```typescript
{
  transforms: ["middle-out"],
  messages: [...],
  model: "any-model"
}
```

### 5.5 Structured Outputs
- JSON şema validasyonu
- Yapılandırılmış yanıt formatı
- Streaming ile uyumlu
```typescript
{
  response_format: {
    type: "json_object",
    schema: {
      type: "object",
      properties: {
        weather: { type: "string" },
        temperature: { type: "number" }
      }
    }
  }
}
```

## 6. Streaming Kullanımı

### 6.1 OpenAI SDK ile Streaming
```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "OPENROUTER_API_KEY",
});

const stream = await client.chat.completions.create({
  model: "openai/gpt-4",
  messages: [{ role: "user", content: "Hello" }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### 6.2 Fetch API ile Streaming
```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'openai/gpt-4',
    messages: [{ role: 'user', content: 'Hello' }],
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices[0].delta.content;
        if (content) console.log(content);
      } catch (e) {
        // Ignore invalid JSON
      }
    }
  }
}
```

## 7. Best Practices

### 7.1 Model Seçimi
- Uygun model seçimi için auto-router kullanımı
- Fallback modeller tanımlama
- Token limitlerini göz önünde bulundurma

### 7.2 Performans Optimizasyonu
- Streaming kullanımı
- Prompt caching stratejisi
- Message transforms ile token optimizasyonu

### 7.3 Hata Yönetimi
- Rate limiting için exponential backoff
- Provider hatalarında fallback kullanımı
- Yapısal hataların ele alınması

## 8. Önemli Notlar
- Farklı modeller farklı tokenization kullanır
- Token sayımı ve maliyet model bazında değişir
- 8k token üzeri promptlar için otomatik transform aktif
- Anthropic modelleri için maksimum 1000 mesaj limiti

## 9. Referanslar
- [Quickstart](https://openrouter.ai/docs/quickstart)
- [API Reference](https://openrouter.ai/docs/api-reference/overview)
- [Models](https://openrouter.ai/docs/models)
- [Features](https://openrouter.ai/docs/features) 