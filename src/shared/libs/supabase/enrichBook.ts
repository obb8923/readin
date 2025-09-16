import { callPerplexityViaEdge, PerplexityRequest } from './supabase-perplexity';

export type PhysicalInfo = {
  width: number;
  height: number;
  thickness: number;
  pages: number;
  weight: number; // gram
};

function parsePerplexityContent(content: string): any {
  const trimmed = (content ?? '').trim();
  // ```json ... ``` 또는 ``` ... ``` 코드블록 처리
  if (trimmed.startsWith('```')) {
    // 첫 줄은 ``` 또는 ```json 일 수 있음 → 다음 줄부터 내용 시작
    const firstNewline = trimmed.indexOf('\n');
    const afterFence = firstNewline >= 0 ? trimmed.slice(firstNewline + 1) : trimmed;
    const closingIndex = afterFence.lastIndexOf('```');
    const inner = closingIndex >= 0 ? afterFence.slice(0, closingIndex) : afterFence;
    const innerTrimmed = inner.trim();
    return JSON.parse(innerTrimmed);
  }

  // 일반 JSON 문자열 시도
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    // 주변 텍스트가 섞여 있을 수 있으니 가장 바깥 { ... }만 추출
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const candidate = trimmed.slice(start, end + 1);
      return JSON.parse(candidate);
    }
    throw new Error('Perplexity content JSON 추출 실패');
  }
}

export async function fetchPhysicalInfoWithPerplexity(input: {
  title: string;
  authors: string[];
  publisher: string;
  isbn?: string;
}): Promise<PhysicalInfo> {
  const system = `
  You are an assistant that retrieves the physical information of books.
You must respond only in the following JSON format:
{"width": number, "height": number, "thickness": number, "pages": number, "weight": number}
Units: mm (millimeters) for dimensions, g (grams) for weight, and pages must be an integer.
Find the book’s physical information based on its title, author, publisher, and ISBN.
Provide the most reliable values possible.
If there is either too much or too little information about a book, find the most representative edition and make sure to always fill in numeric values for each key (width, height, thickness, pages, weight).
response_format: {
    type: 'json_schema',
    json_schema: {
      schema: {
        type: 'object',
        properties: {
          width: { type: 'number' },
          height: { type: 'number' },
          thickness: { type: 'number' },
          pages: { type: 'integer' },
          weight: { type: 'number' }
        },
        required: ['width','height','thickness','pages','weight'],
        additionalProperties: false
      }
    }
  }
`;

  const user = `Find the book’s physical information based on its title, author, publisher, and ISBN.
Title: ${input.title}
Author: ${input.authors.join(', ')}
Publisher: ${input.publisher}
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
  // console.log('content:',content);
  if (!content) {
    throw new Error('Perplexity 응답이 비어 있습니다.');
  }
  try {
    const data = parsePerplexityContent(content);
    const width = Number(data?.width);
    const height = Number(data?.height);
    const thickness = Number(data?.thickness);
    const pages = Number(data?.pages);
    const weight = Number(data?.weight);
    if ([width, height, thickness, pages, weight].some((v) => !Number.isFinite(v))) {
      throw new Error('파싱된 물리 정보가 유효하지 않습니다.');
    }
    return { width, height, thickness, pages, weight };
  } catch (e) {
    console.error('Perplexity JSON 파싱 실패:', e, content);
    throw new Error('물리 정보 파싱 실패');
  }
}


