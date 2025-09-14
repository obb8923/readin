import { supabase } from '../supabase';

export type ReadingLogCreateInput = {
  userId: string;
  bookId: string | number;
  rate: number;
  memo: string;
  startedAt?: string | null; // YYYY-MM-DD
  finishedAt?: string | null; // YYYY-MM-DD
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
    // created_at은 서버 default(now()) 사용
    // updated_at은 트리거/서버 로직이 없으면 업데이트 시점에만 세팅
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


