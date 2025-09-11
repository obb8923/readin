import { supabase } from './supabase';
import { BookType } from '@/shared/type/bookType';

export interface KakaoBookSearchRequest {
  query: string;
  page?: number;
  size?: number;
  sort?: 'accuracy' | 'latest' | 'sale';
}

export interface KakaoBookSearchResponse {
  books: BookType[];
  meta: {
    totalCount: number;
    pageableCount: number;
    isEnd: boolean;
    currentPage: number;
    pageSize: number;
  };
}

/**
 * 카카오 책검색 API를 사용하여 책을 검색하는 함수
 * @param searchQuery 사용자가 입력한 검색어
 * @param options 검색 옵션 (페이지, 크기, 정렬)
 * @returns KakaoBookSearchResponse
 */
export async function searchBooksWithKakao(
  searchQuery: string,
  options: {
    page?: number;
    size?: number;
    sort?: 'accuracy' | 'latest' | 'sale';
  } = {}
): Promise<KakaoBookSearchResponse> {
  try {
    const { page = 1, size = 10, sort = 'accuracy' } = options;

    const { data, error } = await supabase.functions.invoke('kakao-book-search', {
      body: {
        query: searchQuery,
        page,
        size,
        sort,
      },
    });

    if (error) {
      // supabase-js v2 에러 객체에 추가 컨텍스트가 있을 수 있음
      const anyErr: any = error as any;
      const status = anyErr?.context?.response?.status;
      const statusText = anyErr?.context?.response?.statusText;
      let responseText: string | undefined;
      try {
        responseText = await anyErr?.context?.response?.text();
      } catch (_) {}
      console.error('[kakao-book-search] invoke error:', {
        message: error.message,
        status,
        statusText,
        responseText,
      });
      throw new Error(`Supabase function error: ${error.message}${status ? ` (status: ${status})` : ''}`);
    }

    if (!data) {
      throw new Error('검색 결과를 받지 못했습니다.');
    }

    return data;
  } catch (error) {
    console.error('카카오 책검색 오류:', error);
    throw new Error(
      `책 검색 중 오류가 발생했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`
    );
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

/**
 * 간단한 책 검색 함수 (기본 옵션 사용)
 * @param searchQuery 검색어
 * @returns BookType 배열
 */
export async function searchBooks(searchQuery: string): Promise<BookType[]> {
  const cleanedQuery = cleanSearchQuery(searchQuery);
  const response = await searchBooksWithKakao(cleanedQuery);
  return response.books;
}
