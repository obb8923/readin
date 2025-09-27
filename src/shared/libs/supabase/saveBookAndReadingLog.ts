import { supabase } from './supabase';
import { BookType, SavedBook } from '@/shared/type/bookType';
import { ReadingLogWithBook } from './reading_logs';
import { useReadingLogsWithBooksStore } from '@/shared/store/readingLogsWithBooksStore';
import { DEFAULT_THICKNESS, DEFAULT_HEIGHT, DEFAULT_WIDTH, DEFAULT_WEIGHT, DEFAULT_PAGES } from '@constant/defaultBook';

type Physical = Partial<Pick<BookType, 'width' | 'height' | 'thickness' | 'weight' | 'pages'>>;

export type SaveParams = {
  book: BookType;
  physical?: Physical | null;
  rate: number; // 0~100
  memo: string;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  kdc?: string | null;
};

export type Save2Params = {
  title: string;
  author: string;
  publisher: string;
  physical?: Physical | null;
  rate: number; // 0~100
  memo: string;
  startedAt?: Date | null;
  finishedAt?: Date | null;
};

function toISODateOnly(input?: Date | null): string | undefined {
  if (!input) return undefined;
  const iso = input.toISOString();
  return iso.split('T')[0];
}

export async function saveBookAndLog(params: SaveParams) {
  const { data: userInfo, error: userError } = await supabase.auth.getUser();
  if (userError || !userInfo?.user) {
    throw new Error('로그인이 필요합니다.');
  }

  const userId = userInfo.user.id;

  const nowIso = new Date().toISOString();
  const physical: Physical = params.physical ?? {};

  // 물리적 속성에 기본값 적용
  const getThickness = () => {
    const value = physical.thickness ?? params.book.thickness ?? null;
    return value && value < DEFAULT_THICKNESS ? DEFAULT_THICKNESS : value;
  };

  const getHeight = () => {
    const value = physical.height ?? params.book.height ?? null;
    return value && value < DEFAULT_HEIGHT ? DEFAULT_HEIGHT : value;
  };

  const getWidth = () => {
    const value = physical.width ?? params.book.width ?? null;
    return value && value < DEFAULT_WIDTH ? DEFAULT_WIDTH : value;
  };

  const getWeight = () => {
    const value = physical.weight ?? params.book.weight ?? null;
    return value && value < DEFAULT_WEIGHT ? DEFAULT_WEIGHT : value;
  };

  const getPages = () => {
    const value = physical.pages ?? params.book.pages ?? null;
    return value && value < DEFAULT_PAGES ? DEFAULT_PAGES : value;
  };

  const bookRow = {
    // id는 자동 생성되므로 제외
    title: params.book.title || '',
    author: params.book.author || [], // 배열 타입, 빈 배열로 기본값 설정
    publisher: params.book.publisher || '',
    kdc: (params.kdc ?? params.book.kdc) ?? null,
    isbn: params.book.isbn || null,
    description: params.book.description || '',
    image_url: params.book.imageUrl || null,
    width: getWidth(),
    height: getHeight(),
    thickness: getThickness(),
    weight: getWeight(),
    pages: getPages(),
    created_at: nowIso,
    updated_at: nowIso,
  } as Record<string, any>;

  // books upsert (isbn을 unique key로 가정)
  const { data: upsertedBooks, error: upsertErr } = await supabase
    .from('books')
    .upsert(bookRow, { onConflict: 'isbn' })
    .select();

  if (upsertErr) {
    throw upsertErr;
  }

  const insertedBook = Array.isArray(upsertedBooks) ? upsertedBooks[0] : upsertedBooks;
  const bookId = insertedBook?.id ?? params.book.id ?? params.book.isbn;

  const logRow = {
    user_id: userId,
    book_id: bookId,
    rate: params.rate,
    memo: params.memo,
    started_at: toISODateOnly(params.startedAt) ?? null,
    finished_at: toISODateOnly(params.finishedAt) ?? null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const { data: insertedLog, error: logErr } = await supabase.from('reading_logs').insert(logRow).select('*').limit(1);
  if (logErr) {
    throw logErr;
  }

  const newLog = Array.isArray(insertedLog) ? insertedLog[0] : insertedLog;

  // 최소값이 적용된 완전한 책 데이터
  const finalBookData = {
    ...insertedBook,
    width: getWidth(),
    height: getHeight(),
    thickness: getThickness(),
    weight: getWeight(),
    pages: getPages(),
  };

  // ReadingLogWithBook 형태로 변환하여 store에 추가
  const newLogWithBook: ReadingLogWithBook = {
    ...newLog,
    book: finalBookData
  };

  // store에 추가
  const addReadingLog = useReadingLogsWithBooksStore.getState().addReadingLog;
  addReadingLog(newLogWithBook);

  const saved: SavedBook = {
    book: {
      ...params.book,
      width: getWidth(),
      height: getHeight(),
      thickness: getThickness(),
      weight: getWeight(),
      pages: getPages(),
    },
    record: {
      rate: params.rate,
      memo: params.memo,
      startedAt: toISODateOnly(params.startedAt),
      finishedAt: toISODateOnly(params.finishedAt),
    },
    createdAt: nowIso,
    updatedAt: nowIso,
    bookId: String(bookId),
  };

  return saved;
}

export async function save2BookAndLog(params: Save2Params) {
  const { data: userInfo, error: userError } = await supabase.auth.getUser();
  if (userError || !userInfo?.user) {
    throw new Error('로그인이 필요합니다.');
  }

  const userId = userInfo.user.id;

  const nowIso = new Date().toISOString();
  const physical: Physical = params.physical ?? {};

  // 물리적 속성은 null 허용 (기본값 적용하지 않음)
  const getThickness = () => physical.thickness ?? null;
  const getHeight = () => physical.height ?? null;
  const getWidth = () => physical.width ?? null;
  const getWeight = () => physical.weight ?? null;
  const getPages = () => physical.pages ?? null;

  const bookRow = {
    // id는 자동 생성되므로 제외
    title: params.title || '',
    author: [params.author], // 단일 문자열을 배열로 변환
    publisher: params.publisher || '',
    kdc: null,
    isbn: null, // save2 모드에서는 ISBN 없음
    description: '',
    image_url: null,
    width: getWidth(),
    height: getHeight(),
    thickness: getThickness(),
    weight: getWeight(),
    pages: getPages(),
    created_at: nowIso,
    updated_at: nowIso,
  } as Record<string, any>;

  // books insert (ISBN이 없으므로 upsert 대신 insert 사용)
  const { data: insertedBooks, error: insertErr } = await supabase
    .from('books')
    .insert(bookRow)
    .select();

  if (insertErr) {
    throw insertErr;
  }

  const insertedBook = Array.isArray(insertedBooks) ? insertedBooks[0] : insertedBooks;
  const bookId = insertedBook?.id;

  const logRow = {
    user_id: userId,
    book_id: bookId,
    rate: params.rate,
    memo: params.memo,
    started_at: toISODateOnly(params.startedAt) ?? null,
    finished_at: toISODateOnly(params.finishedAt) ?? null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const { data: insertedLog, error: logErr } = await supabase.from('reading_logs').insert(logRow).select('*').limit(1);
  if (logErr) {
    throw logErr;
  }

  const newLog = Array.isArray(insertedLog) ? insertedLog[0] : insertedLog;

  // ReadingLogWithBook 형태로 변환하여 store에 추가
  const newLogWithBook: ReadingLogWithBook = {
    ...newLog,
    book: insertedBook
  };

  // store에 추가
  const addReadingLog = useReadingLogsWithBooksStore.getState().addReadingLog;
  addReadingLog(newLogWithBook);

  const saved: SavedBook = {
    book: {
      id: String(bookId),
      title: params.title,
      author: [params.author],
      publisher: params.publisher,
      isbn: '',
      description: '',
      imageUrl: '',
      kdc: undefined,
      width: getWidth() ?? 0,
      height: getHeight() ?? 0,
      thickness: getThickness() ?? 0,
      weight: getWeight() ?? 0,
      pages: getPages() ?? 0,
    },
    record: {
      rate: params.rate,
      memo: params.memo,
      startedAt: toISODateOnly(params.startedAt),
      finishedAt: toISODateOnly(params.finishedAt),
    },
    createdAt: nowIso,
    updatedAt: nowIso,
    bookId: String(bookId),
  };

  return saved;
}


