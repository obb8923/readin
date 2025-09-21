import { searchBooks as searchBooksWithKakao, cleanSearchQuery } from './kakaoBookSearch';
import { BookType } from '@/shared/type/bookType';

/**
 * 카카오 책검색 API를 사용하여 책을 검색하는 함수
 * @param searchQuery 사용자가 입력한 검색어
 * @returns BookType 배열
 */
export async function searchBooks(searchQuery: string): Promise<BookType[]> {
  try {
    const cleanedQuery = cleanSearchQuery(searchQuery);
    const books = await searchBooksWithKakao(cleanedQuery);
    return books;
  } catch (error) {
    console.error('책 검색 오류:', error);
    throw new Error(`책 검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

