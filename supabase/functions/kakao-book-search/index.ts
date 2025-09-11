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

interface KakaoBookSearchRequest {
  query: string
  page?: number
  size?: number
  sort?: 'accuracy' | 'latest' | 'sale'
}

interface KakaoBookSearchResponse {
  documents: Array<{
    title: string
    contents: string
    url: string
    isbn: string
    datetime: string
    authors: string[]
    publisher: string
    translators: string[]
    price: number
    sale_price: number
    thumbnail: string
    status: string
  }>
  meta: {
    is_end: boolean
    pageable_count: number
    total_count: number
  }
}

interface BookType {
  id: string
  title: string
  author: string[]
  publisher: string
  category: string[]
  isbn: string
  description: string
  imageUrl: string
  height: number
  width: number
  thickness: number
  pages: number
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('KAKAO_REST_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing KAKAO_REST_API_KEY secret' }),
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

    const body = await req.json().catch(() => undefined) as KakaoBookSearchRequest | undefined
    if (!body?.query) {
      return new Response(
        JSON.stringify({ error: 'query is required' }),
        { status: 400, headers: jsonHeaders },
      )
    }

    const { query, page = 1, size = 10, sort = 'accuracy' } = body

    // 카카오 책검색 API 호출
    const searchUrl = new URL('https://dapi.kakao.com/v3/search/book')
    searchUrl.searchParams.set('query', query)
    searchUrl.searchParams.set('page', page.toString())
    searchUrl.searchParams.set('size', size.toString())
    searchUrl.searchParams.set('sort', sort)

    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `KakaoAK ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({ 
          error: 'Kakao API error', 
          status: response.status,
          message: errorText 
        }),
        { status: response.status, headers: jsonHeaders },
      )
    }

    const data: KakaoBookSearchResponse = await response.json()

    // 카카오 API 응답을 BookType 형식으로 변환
    const books: BookType[] = data.documents.map((doc, index) => ({
      id: doc.isbn || `kakao_${index}_${Date.now()}`,
      title: doc.title || '제목 없음',
      author: doc.authors || [],
      publisher: doc.publisher || '출판사 정보 없음',
      category: [], // 카카오 API에서는 카테고리 정보를 제공하지 않음
      isbn: doc.isbn || '',
      description: doc.contents || '설명 없음',
      imageUrl: doc.thumbnail || '',
      height: 200, // 기본값 설정
      width: 140,  // 기본값 설정
      thickness: 20, // 기본값 설정
      pages: 300, // 기본값 설정
    }))

    return new Response(
      JSON.stringify({
        books,
        meta: {
          totalCount: data.meta.total_count,
          pageableCount: data.meta.pageable_count,
          isEnd: data.meta.is_end,
          currentPage: page,
          pageSize: size,
        }
      }),
      { status: 200, headers: jsonHeaders },
    )

  } catch (err) {
    console.error('Kakao book search error:', err)
    return new Response(
      JSON.stringify({ 
        error: 'Unexpected error', 
        message: String(err) 
      }),
      { status: 500, headers: jsonHeaders },
    )
  }
})
