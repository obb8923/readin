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
  
  const nowIso = new Date().toISOString();
  
  // 기본값 설정
  const DEFAULT_THICKNESS = 15; // mm
  const DEFAULT_HEIGHT = 225; // mm
  const DEFAULT_WIDTH = 30; // mm
  const DEFAULT_WEIGHT = 250; // g
  const DEFAULT_PAGES = 100;
  // 물리적 속성에 기본값 적용 (기존 값이 기본값보다 작으면 기본값 사용)
  const getThickness = () => {
    const value = physical?.thickness ?? book.thickness ?? null;
    return value && value < DEFAULT_THICKNESS ? DEFAULT_THICKNESS : value;
  };
  
  const getHeight = () => {
    const value = physical?.height ?? book.height ?? null;
    return value && value < DEFAULT_HEIGHT ? DEFAULT_HEIGHT : value;
  };
  
  const getWidth = () => {
    const value = physical?.width ?? book.width ?? null;
    return value && value < DEFAULT_WIDTH ? DEFAULT_WIDTH : value;
  };
  
  const getWeight = () => {
    const value = physical?.weight ?? book.weight ?? null;
    return value && value < DEFAULT_WEIGHT ? DEFAULT_WEIGHT : value;
  };
  const getPages = () => {
    const value = physical?.pages ?? book.pages ?? null;
    return value && value < DEFAULT_PAGES ? DEFAULT_PAGES : value;
  };
  const row: Record<string, any> = {
    // id는 자동 생성되므로 제외
    title: book.title || '',
    author: book.author || [], // 배열 타입, 빈 배열로 기본값 설정
    publisher: book.publisher || '',
    category: book.category || [], // 배열 타입, 빈 배열로 기본값 설정
    isbn: book.isbn || null,
    description: book.description || '',
    image_url: book.imageUrl || null,
    width: getWidth(),
    height: getHeight(),
    thickness: getThickness(),
    weight: getWeight(),
    pages: getPages(),
    created_at: nowIso,
    updated_at: nowIso,
  };
  
  if(__DEV__) console.log('createBook - 삽입할 데이터:', JSON.stringify(row, null, 2));
  
  const { data, error } = await supabase.from('books').upsert(row, { onConflict: 'isbn' }).select('*').limit(1);
  
  if (error) {
    console.error('createBook - Supabase 오류:', error);
    throw error;
  }
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


