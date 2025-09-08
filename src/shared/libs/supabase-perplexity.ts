/* eslint-disable @typescript-eslint/no-explicit-any */
export type PerplexityMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type PerplexityRequest = {
  model?: string;
  messages: PerplexityMessage[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

export async function callPerplexityViaEdge(
  baseUrl: string,
  request: PerplexityRequest,
): Promise<any> {
  const url = `${baseUrl.replace(/\/$/, '')}/functions/v1/perplexity`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Perplexity edge error: ${res.status} ${text}`)
  }
  const isStream = request.stream === true
  if (isStream) {
    // React Native 기본 fetch 타입에는 body 스트림이 노출되지 않음
    // SSE를 그대로 소비하려면 별도 스트리밍 클라이언트가 필요
    return res.text()
  }
  return res.json()
}


