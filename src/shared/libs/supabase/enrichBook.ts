import { callPerplexityViaEdge, PerplexityRequest } from './supabase-perplexity';

export type PhysicalInfo = {
  width: number;
  height: number;
  thickness: number;
  pages: number;
};

export async function fetchPhysicalInfoWithPerplexity(input: {
  title: string;
  authors: string[];
  publisher: string;
  isbn?: string;
}): Promise<PhysicalInfo> {
  const system = `너는 도서의 물리 정보를 찾아주는 도우미야.
반드시 아래 JSON 형식으로만 답해:
{"width": number, "height": number, "thickness": number, "pages": number}
단위는 mm(밀리미터), 페이지는 정수. 모르겠으면 합리적인 평균값을 넣지 말고 최대한 신뢰 가능한 값을 찾아.`;

  const user = `책 정보를 기반으로 실제 물리 정보를 알려줘.
제목: ${input.title}
저자: ${input.authors.join(', ')}
출판사: ${input.publisher}
ISBN: ${input.isbn ?? ''}`;

  const request: PerplexityRequest = {
    model: 'sonar',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.1,
    max_tokens: 256,
  };

  const resp = await callPerplexityViaEdge(request);
  const content = resp?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Perplexity 응답이 비어 있습니다.');
  }
  try {
    const data = JSON.parse(content);
    const width = Number(data?.width);
    const height = Number(data?.height);
    const thickness = Number(data?.thickness);
    const pages = Number(data?.pages);
    if ([width, height, thickness, pages].some((v) => !Number.isFinite(v))) {
      throw new Error('파싱된 물리 정보가 유효하지 않습니다.');
    }
    return { width, height, thickness, pages };
  } catch (e) {
    console.error('Perplexity JSON 파싱 실패:', e, content);
    throw new Error('물리 정보 파싱 실패');
  }
}


