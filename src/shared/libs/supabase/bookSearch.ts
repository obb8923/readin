import { callPerplexityViaEdge, PerplexityRequest } from './supabase-perplexity';
import { BookType } from '@/shared/type/bookType';

/**
 * Perplexity를 사용하여 책을 검색하는 함수
 * @param searchQuery 사용자가 입력한 검색어
 * @returns BookType 배열
 */
export async function searchBooks(searchQuery: string): Promise<BookType[]> {
  try {
    const request: PerplexityRequest = {
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: `당신은 도서 검색 전문가입니다. 사용자가 입력한 검색어와 관련성이 높은 책들을 찾아주세요. 
          응답은 반드시 다음 JSON 형식으로만 제공해주세요:
          [
            {
              "id": "고유한_책_ID",
              "title": "책 제목",
              "author": ["저자1", "저자2"],
              "publisher": "출판사",
              "category": ["카테고리1", "카테고리2"],
              "isbn": "ISBN_번호",
              "description": "책 설명",
              "imageUrl": "이미지_URL",
              "height": number,
              "width": number,
              "thickness": number,
              "pages": number
            }
          ]
          
          검색어와 관련성이 높은 책들을 최대 10개까지 찾아서 배열로 반환해주세요. 
          각 책의 정보는 실제 존재하는 책을 기반으로 정확하게 작성해주세요.
          
          **중요**: imageUrl을 설정할 때는 교보문고의 이미지를 우선적으로 사용해주세요. 
          교보문고에서 해당 책의 이미지를 찾을 수 없는 경우에만 다른 사이트의 이미지를 사용하세요.
          예시:https://contents.kyobobook.co.kr/sih/fit-in/600x0/pdt/9791187142560.jpg
          
          JSON 형식 외의 다른 텍스트는 포함하지 마세요.`
        },
        {
          role: 'user',
          content: `다음 검색어와 관련된 책들을 찾아주세요: "${searchQuery}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    };

    const response = await callPerplexityViaEdge(request);
    
    // Perplexity 응답에서 content 추출
    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Perplexity API에서 유효한 응답을 받지 못했습니다.');
    }

    // JSON 파싱 시도
    try {
      const books: BookType[] = JSON.parse(content);
      
      // BookType 형식 검증
      if (!Array.isArray(books)) {
        throw new Error('응답이 배열 형식이 아닙니다.');
      }

      // 각 책의 필수 필드 검증
      const validBooks = books.filter(book => 
        book.id && 
        book.title && 
        Array.isArray(book.author) && 
        book.publisher && 
        Array.isArray(book.category) && 
        book.isbn && 
        book.description && 
        book.imageUrl &&
        typeof book.height === 'number' &&
        typeof book.width === 'number' &&
        typeof book.thickness === 'number' &&
        typeof book.pages === 'number'
      );

      return validBooks;
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('Perplexity 응답:', content);
      throw new Error('검색 결과를 파싱하는 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('책 검색 오류:', error);
    throw new Error(`책 검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 검색어를 정리하고 최적화하는 함수
 * @param query 원본 검색어
 * @returns 정리된 검색어
 */
export function cleanSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/\s+/g, ' ') // 여러 공백을 하나로
    .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거 (한글, 영문, 숫자, 공백만 유지)
    .substring(0, 100); // 최대 100자로 제한
}
