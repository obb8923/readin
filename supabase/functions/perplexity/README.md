# Supabase Edge Function: perplexity

Perplexity API 프록시 Edge Function 입니다. 앱에서 비밀키를 노출하지 않고 안전하게 호출합니다.

## 환경 변수

- PERPLEXITY_API_KEY: Perplexity API 키

로컬 개발 시 다음 명령으로 설정하세요.

```bash
supabase secrets set PERPLEXITY_API_KEY=your_api_key
```

프로덕션 프로젝트에 설정할 때는 해당 원격 프로젝트를 대상으로 실행하세요.

```bash
supabase secrets set --project-ref <PROJECT_REF> PERPLEXITY_API_KEY=your_api_key
```

## 로컬 실행

```bash
supabase start
supabase functions serve perplexity
```

.env 파일을 사용하려면 다음과 같이 지정할 수 있습니다.

```bash
supabase functions serve perplexity --env-file supabase/.env.local
```

## 배포

```bash
supabase functions deploy perplexity
```

## 요청 예시

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-sonar-small-128k-chat",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "stream": false
  }' \
  http://127.0.0.1:54321/functions/v1/perplexity
```

스트리밍(`text/event-stream`)을 사용하려면 `"stream": true` 로 설정하세요.
