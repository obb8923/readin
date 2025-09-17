import { supabase } from '../supabase';

export type ReadingLogCreateInput = {
  userId: string;
  bookId: string | number;
  rate: number;
  memo: string;
  startedAt?: string | null; // YYYY-MM-DD
  finishedAt?: string | null; // YYYY-MM-DD
};

export type ReadingLog = {
  id: string;
  user_id: string;
  book_id: string | number;
  rate: number;
  memo: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReadingLogWithBook = ReadingLog & {
  book: {
    id: string;
    title: string;
    author: string[];
    publisher: string;
    kdc: string | null;
    isbn: string | null;
    description: string;
    image_url: string | null;
    width: number | null;
    height: number | null;
    thickness: number | null;
    weight: number | null;
    pages: number | null;
    created_at: string;
    updated_at: string;
  };
};

export async function createReadingLog(input: ReadingLogCreateInput) {
  // 사용자 인증 확인
  const { data: userInfo, error: userError } = await supabase.auth.getUser();
  if (userError || !userInfo?.user) {
    throw new Error('로그인이 필요합니다.');
  }
  
  // 사용자 ID 검증
  if (userInfo.user.id !== input.userId) {
    throw new Error('권한이 없습니다.');
  }
  
  const row = {
    user_id: input.userId,
    book_id: input.bookId,
    rate: input.rate,
    memo: input.memo,
    started_at: input.startedAt ?? null,
    finished_at: input.finishedAt ?? null,
  };
  const { data, error } = await supabase.from('reading_logs').insert(row).select('*').limit(1);
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function getLogsByBookId(bookId: string | number) {
  const { data, error } = await supabase.from('reading_logs').select('*').eq('book_id', bookId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateLogById(id: string | number, updates: Partial<Record<string, any>>) {
  const { data, error } = await supabase.from('reading_logs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select('*').limit(1);
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function deleteLogById(id: string | number) {
  const { error } = await supabase.from('reading_logs').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function getUserReadingLogs(userId: string) {
  // 사용자 인증 확인
  const { data: userInfo, error: userError } = await supabase.auth.getUser();
  if (userError || !userInfo?.user) {
    throw new Error('로그인이 필요합니다.');
  }
  
  // 사용자 ID 검증
  if (userInfo.user.id !== userId) {
    throw new Error('권한이 없습니다.');
  }
  
  const { data, error } = await supabase
    .from('reading_logs')
    .select('*')
    .eq('user_id', userId)
    .order('finished_at', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as ReadingLog[];
}

export async function getUserReadingLogsWithBookInfo(userId: string) {
  
  // 사용자 인증 확인
  const { data: userInfo, error: userError } = await supabase.auth.getUser();
  if (userError || !userInfo?.user) {
    console.error('[getUserReadingLogsWithBookInfo] 인증 실패:', userError);
    throw new Error('로그인이 필요합니다.');
  }
  
  
  // 사용자 ID 검증
  if (userInfo.user.id !== userId) {
    console.error('[getUserReadingLogsWithBookInfo] 사용자 ID 불일치:', { 
      requested: userId, 
      authenticated: userInfo.user.id 
    });
    throw new Error('권한이 없습니다.');
  }
  
  const { data, error } = await supabase
    .from('reading_logs')
    .select(`
      *,
      book:books(*)
    `)
    .eq('user_id', userId)
    .order('finished_at', { ascending: false })
    .order('created_at', { ascending: false });
      
  if (error) {
    console.error('[getUserReadingLogsWithBookInfo] Supabase 쿼리 에러:', error);
    throw error;
  }
  
  return data as ReadingLogWithBook[];
}


