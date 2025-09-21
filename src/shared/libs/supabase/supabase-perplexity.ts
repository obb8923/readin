import { SUPABASE_ANON_KEY ,SUPABASE_EDGE_FUNCTION_PERPLEXITY} from '@env';
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
  request: PerplexityRequest,
): Promise<any> {
  const url = `${SUPABASE_EDGE_FUNCTION_PERPLEXITY}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Perplexity edge error: ${res.status} ${text || 'Edge Function returned a non-2xx status code'}`)
  }
  const isStream = request.stream === true
  if (isStream) {
    return res.text()
  }
  return res.json()
}


