import { callPerplexityViaEdge, PerplexityRequest } from './supabase-perplexity';

export type PhysicalInfo = {
  width: number;
  height: number;
  thickness: number;
  pages: number;
  weight: number; // gram
};

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
  if (!content) {
    throw new Error('Perplexity 응답이 비어 있습니다.');
  }
  try {
    const data = JSON.parse(content);
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


