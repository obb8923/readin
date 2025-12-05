import { ReadingLogWithBook } from '@/shared/libs/supabase/reading_logs';
import { BookWithRecord } from '@/shared/type/bookType';

/**
 * ReadingLogWithBook을 BookWithRecord로 변환하는 공통 함수
 */
export const transformReadingLogToBookWithRecord = (log: ReadingLogWithBook): BookWithRecord => {
  // 커스텀 이미지가 있으면 그것을 우선 사용, 없으면 원본 이미지 사용
  const finalImageUrl = log.custom_image_url || log.book.image_url || '';
  
  return {
    id: log.book.id,
    title: log.book.title,
    author: log.book.author,
    publisher: log.book.publisher,
    kdc: log.book.kdc || undefined,
    isbn: log.book.isbn || '',
    description: log.book.description,
    imageUrl: finalImageUrl,
    height: log.book.height || 0,
    width: log.book.width || 0,
    thickness: log.book.thickness || 0,
    weight: log.book.weight || 0,
    pages: log.book.pages || 0,
    record: {
      id: log.id,
      rate: log.rate,
      memo: log.memo || '',
      startedAt: log.started_at || undefined,
      finishedAt: log.finished_at || undefined,
    },
    createdAt: log.created_at,
    updatedAt: log.updated_at,
    bookId: String(log.book_id),
    customImageUrl: log.custom_image_url || null,
  };
};

/**
 * ReadingLogWithBook을 단순한 책 정보로 변환하는 공통 함수 (TowerOfBooks용)
 */
export const transformReadingLogToBookInfo = (log: ReadingLogWithBook) => ({
  id: log.book.id,
  title: log.book.title,
  author: log.book.author,
  publisher: log.book.publisher,
  kdc: log.book.kdc || undefined,
  isbn: log.book.isbn || '',
  description: log.book.description,
  imageUrl: log.book.image_url || '',
  height: log.book.height || 0,
  width: log.book.width || 0,
  thickness: log.book.thickness || 0,
  weight: log.book.weight || 0,
  pages: log.book.pages || 0,
});
