import { supabase } from './supabase';
import { BookType, SavedBook } from '@/shared/type/bookType';

type Physical = Partial<Pick<BookType, 'width' | 'height' | 'thickness' | 'weight' | 'pages'>>;

export type SaveParams = {
  book: BookType;
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

  const bookRow = {
    // id는 자동 생성되므로 제외
    title: params.book.title || '',
    author: params.book.author || [], // 배열 타입, 빈 배열로 기본값 설정
    publisher: params.book.publisher || '',
    category: params.book.category || [], // 배열 타입, 빈 배열로 기본값 설정
    isbn: params.book.isbn || null,
    description: params.book.description || '',
    image_url: params.book.imageUrl || null,
    width: physical.width ?? params.book.width ?? null,
    height: physical.height ?? params.book.height ?? null,
    thickness: physical.thickness ?? params.book.thickness ?? null,
    weight: physical.weight ?? params.book.weight ?? null,
    pages: physical.pages ?? params.book.pages ?? null,
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

  const { error: logErr } = await supabase.from('reading_logs').insert(logRow);
  if (logErr) {
    throw logErr;
  }

  const saved: SavedBook = {
    book: {
      ...params.book,
      width: bookRow.width ?? 0,
      height: bookRow.height ?? 0,
      thickness: bookRow.thickness ?? 0,
      weight: bookRow.weight ?? 0,
      pages: bookRow.pages ?? 0,
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


