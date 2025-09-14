import { supabase } from '../supabase';
import { BookType } from '@/shared/type/bookType';

export type BookCreateInput = {
  book: BookType;
  physical?: Partial<Pick<BookType, 'width' | 'height' | 'thickness' | 'weight' | 'pages'>> | null;
};

export async function createBook(input: BookCreateInput) {
  const { book, physical } = input;
  
  // 사용자 인증 확인
  const { data: userInfo, error: userError } = await supabase.auth.getUser();
  if (userError || !userInfo?.user) {
    throw new Error('로그인이 필요합니다.');
  }
  console.log('createBook - 사용자 인증 확인됨:', userInfo.user.id);
  
  const nowIso = new Date().toISOString();
  const row: Record<string, any> = {
    // id는 자동 생성되므로 제외
    title: book.title || '',
    author: book.author || [], // 배열 타입, 빈 배열로 기본값 설정
    publisher: book.publisher || '',
    category: book.category || [], // 배열 타입, 빈 배열로 기본값 설정
    isbn: book.isbn || null,
    description: book.description || '',
    image_url: book.imageUrl || null,
    width: physical?.width ?? book.width ?? null,
    height: physical?.height ?? book.height ?? null,
    thickness: physical?.thickness ?? book.thickness ?? null,
    weight: physical?.weight ?? book.weight ?? null,
    pages: physical?.pages ?? book.pages ?? null,
    created_at: nowIso,
    updated_at: nowIso,
  };
  
  console.log('createBook - 삽입할 데이터:', JSON.stringify(row, null, 2));
  
  const { data, error } = await supabase.from('books').upsert(row, { onConflict: 'isbn' }).select('*').limit(1);
  
  if (error) {
    console.error('createBook - Supabase 오류:', error);
    throw error;
  }
  
  console.log('createBook - 성공, 반환 데이터:', data);
  return Array.isArray(data) ? data[0] : data;
}

export async function getBookByIsbn(isbn: string) {
  const { data, error } = await supabase.from('books').select('*').eq('isbn', isbn).limit(1);
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function updateBookById(id: string, updates: Partial<Record<string, any>>) {
  const { data, error } = await supabase.from('books').update(updates).eq('id', id).select('*').limit(1);
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function deleteBookById(id: string) {
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) throw error;
  return true;
}


