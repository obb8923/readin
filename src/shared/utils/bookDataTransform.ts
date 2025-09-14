import { ReadingLogWithBook } from '@/shared/libs/supabase/reading_logs';
import { BookWithRecord } from '@/shared/type/bookType';

/**
 * ReadingLogWithBook을 BookWithRecord로 변환하는 공통 함수
 */
export const transformReadingLogToBookWithRecord = (log: ReadingLogWithBook): BookWithRecord => ({
  id: log.book.id,
  title: log.book.title,
  author: log.book.author,
  publisher: log.book.publisher,
  category: log.book.category,
  isbn: log.book.isbn || '',
  description: log.book.description,
  imageUrl: log.book.image_url || '',
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
});

/**
 * ReadingLogWithBook을 단순한 책 정보로 변환하는 공통 함수 (TowerOfBooks용)
 */
export const transformReadingLogToBookInfo = (log: ReadingLogWithBook) => ({
  id: log.book.id,
  title: log.book.title,
  author: log.book.author,
  publisher: log.book.publisher,
  category: log.book.category,
  isbn: log.book.isbn || '',
  description: log.book.description,
  imageUrl: log.book.image_url || '',
  height: log.book.height || 0,
  width: log.book.width || 0,
  thickness: log.book.thickness || 0,
  weight: log.book.weight || 0,
  pages: log.book.pages || 0,
});
