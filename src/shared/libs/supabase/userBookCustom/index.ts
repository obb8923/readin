import { supabase } from '../supabase';

export interface UserBookCustom {
  id: string;
  user_id: string;
  book_id: string;
  custom_image_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 사용자의 커스텀 책 이미지를 조회합니다.
 * @param userId - 사용자 ID
 * @param bookId - 책 ID
 * @returns 커스텀 이미지 정보 또는 null
 */
export async function getCustomBookImage(
  userId: string,
  bookId: string
): Promise<UserBookCustom | null> {
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
    .from('user_book_custom')
    .select('*')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .single();

  if (error) {
    // 데이터가 없는 경우 null 반환
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as UserBookCustom;
}

/**
 * 사용자의 커스텀 책 이미지를 저장하거나 업데이트합니다.
 * @param userId - 사용자 ID
 * @param bookId - 책 ID
 * @param imageUrl - Supabase Storage의 이미지 URL
 * @returns 저장된 커스텀 이미지 정보
 */
export async function saveCustomBookImage(
  userId: string,
  bookId: string,
  imageUrl: string
): Promise<UserBookCustom> {
  // 사용자 인증 확인
  const { data: userInfo, error: userError } = await supabase.auth.getUser();
  if (userError || !userInfo?.user) {
    throw new Error('로그인이 필요합니다.');
  }

  // 사용자 ID 검증
  if (userInfo.user.id !== userId) {
    throw new Error('권한이 없습니다.');
  }

  // 기존 데이터 확인
  const existing = await getCustomBookImage(userId, bookId);

  if (existing) {
    // 업데이트
    const { data, error } = await supabase
      .from('user_book_custom')
      .update({
        custom_image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as UserBookCustom;
  } else {
    // 새로 생성
    const { data, error } = await supabase
      .from('user_book_custom')
      .insert({
        user_id: userId,
        book_id: bookId,
        custom_image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as UserBookCustom;
  }
}

/**
 * 사용자의 커스텀 책 이미지를 삭제합니다.
 * @param userId - 사용자 ID
 * @param bookId - 책 ID
 */
export async function deleteCustomBookImage(
  userId: string,
  bookId: string
): Promise<void> {
  // 사용자 인증 확인
  const { data: userInfo, error: userError } = await supabase.auth.getUser();
  if (userError || !userInfo?.user) {
    throw new Error('로그인이 필요합니다.');
  }

  // 사용자 ID 검증
  if (userInfo.user.id !== userId) {
    throw new Error('권한이 없습니다.');
  }

  const { error } = await supabase
    .from('user_book_custom')
    .delete()
    .eq('user_id', userId)
    .eq('book_id', bookId);

  if (error) {
    throw error;
  }
}

