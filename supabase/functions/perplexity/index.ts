/* eslint-disable */
// deno-lint-ignore-file
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const jsonHeaders: Record<string, string> = {
  ...corsHeaders,
  'Content-Type': 'application/json; charset=utf-8',
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing PERPLEXITY_API_KEY secret' }),
        { status: 500, headers: jsonHeaders },
      )
    }

    const contentType = req.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { status: 415, headers: jsonHeaders },
      )
    }

    const body = await req.json().catch(() => undefined) as Record<string, unknown> | undefined
    const messages = (body as any)?.messages
    const model = (body as any)?.model ?? 'llama-3.1-sonar-small-128k-chat'
    const stream = Boolean((body as any)?.stream ?? false)
    const temperature = (body as any)?.temperature ?? 0.2
    const top_p = (body as any)?.top_p ?? 0.9
    const max_tokens = (body as any)?.max_tokens ?? 1024

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages[] is required' }),
        { status: 400, headers: jsonHeaders },
      )
    }

    const payload = {
      model,
      messages,
      stream,
      temperature,
      top_p,
      max_tokens,
    }

    const upstream = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (stream) {
      const streamHeaders = new Headers(corsHeaders)
      streamHeaders.set('Content-Type', 'text/event-stream')
      streamHeaders.set('Cache-Control', 'no-cache')
      streamHeaders.set('Connection', 'keep-alive')
      return new Response(upstream.body, {
        status: upstream.status,
        headers: streamHeaders,
      })
    }

    const data = await upstream
      .json()
      .catch(async () => ({ error: 'Upstream parse error', text: await upstream.text() }))

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: jsonHeaders,
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Unexpected error', message: String(err) }),
      { status: 500, headers: jsonHeaders },
    )
  }
})


