import { supabase } from './supabase';

// 저장할 독서 기록 데이터의 타입을 정의합니다. (필요에 따라 확장)
interface ReadingRecordData {
  user_id: string; // 사용자 ID (인증 시스템 연동 필요)
  isbn: string;
  title: string;
  authors: string[];
  image_url: string;
  progress: number;
  rating: number;
  start_date: string | null; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
  review: string;
}

// 리뷰와 책 정보를 함께 담는 타입 정의
export interface ReviewWithBook {
  id: number; // 리뷰 테이블의 기본 키 (supabase 기본 id 사용)
  isbn: string;
  user_id: string;
  progress: number;
  rating: number;
  start_date: string | null;
  end_date: string | null;
  review: string | null;
  created_at: string; // 리뷰 생성 시간 (있다고 가정)
  books: {
    title: string;
    author: string;
    image_url: string;
  } | null; // books 테이블 정보
}
export interface Book {
  isbn: string;
  title: string;
  authors: string[];
  thumbnail: string;
}
/**
 * 책 정보와 독서 기록을 각각 books와 reviews 테이블에 저장합니다.
 * books 테이블에는 중복 확인 후 없는 경우에만 삽입합니다.
 * @param recordData 저장할 독서 기록 및 책 정보 데이터 객체
 * @returns {Promise<{ success: boolean, error?: any }>} 저장 성공 여부와 에러 객체
 */
export const saveReadingRecord = async (recordData: ReadingRecordData): Promise<{ success: boolean, error?: any }> => {
  console.log('Supabase 저장 시도 (Books & Reviews):', recordData);

  // 필수 필드 유효성 검사 (user_id, isbn은 필수)
  if (!recordData.user_id || !recordData.isbn) {
    console.error('저장 실패: 필수 필드 누락 (user_id, isbn)');
    return { success: false, error: new Error('필수 정보(사용자 ID, ISBN)가 누락되었습니다.') };
  }

  try {
    // --- 1. Books 테이블 확인 및 삽입 ---
    // ISBN으로 이미 책이 존재하는지 확인
    const { data: existingBook, error: selectError } = await supabase
      .from('books')
      .select('isbn')
      .eq('isbn', recordData.isbn)
      .maybeSingle(); // 결과가 없으면 null, 있으면 객체 반환

    if (selectError) {
      console.error('Books 테이블 조회 오류:', selectError);
      return { success: false, error: selectError };
    }

    // 책이 존재하지 않으면 삽입
    if (!existingBook) {
      console.log(`Books 테이블에 새 책 추가: ${recordData.isbn}`);
      const bookDataToInsert = {
        isbn: recordData.isbn,
        title: recordData.title,
        author: recordData.authors.join(','),
        image_url: recordData.image_url // 필드명 매핑
      };
      console.log('[supabaseOperations.ts] Inserting into books table with image_url:', bookDataToInsert.image_url); // 추가된 로그
      const { error: insertBookError } = await supabase
        .from('books')
        .insert([bookDataToInsert]);

      if (insertBookError) {
        console.error('Books 테이블 삽입 오류:', insertBookError);
        return { success: false, error: insertBookError };
      }
      console.log(`Books 테이블 삽입 성공: ${recordData.isbn}`);
    } else {
      console.log(`Books 테이블에 책 이미 존재: ${recordData.isbn}`);
    }

    // --- 2. Reviews 테이블 삽입 ---
    console.log(`Reviews 테이블에 기록 추가: ${recordData.isbn}`);
    const { data: reviewData, error: insertReviewError } = await supabase
      .from('reviews')
      .insert([
        {
          isbn: recordData.isbn, // 외래 키
          user_id: recordData.user_id, // 사용자 ID
          progress: recordData.progress,
          rating: recordData.rating,
          start_date: recordData.start_date,
          end_date: recordData.end_date,
          review: recordData.review || null // review가 빈 문자열이면 null로 저장
        }
      ])
      .select(); // 삽입된 데이터 확인 (선택 사항)

    if (insertReviewError) {
      console.error('Reviews 테이블 삽입 오류:', insertReviewError);
      // 여기서 이미 삽입된 book 정보를 롤백할지 여부는 정책에 따라 결정
      return { success: false, error: insertReviewError };
    }

    console.log('Reviews 테이블 삽입 성공:', reviewData);
    return { success: true };

  } catch (err) {
    console.error('saveReadingRecord 함수 처리 중 예외 발생:', err);
    return { success: false, error: err };
  }
};

/**
 * 현재 로그인된 Supabase 사용자의 ID를 가져옵니다.
 * @returns {Promise<string | null>} 사용자 ID 또는 null (로그인되지 않았거나 오류 발생 시)
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.log('Supabase 사용자 정보 가져오기 오류:', error);
      return null; // 오류 발생 시 null 반환
    }

    if (!user) {
      console.log('로그인된 사용자가 없습니다.');
      return null; // 사용자 정보가 없으면 null 반환
    }

    return user.id; // 사용자 ID 반환

  } catch (err) {
    console.error('getCurrentUserId 함수 오류:', err);
    return null; // 예외 발생 시 null 반환
  }
};

/**
 * 현재 로그인된 사용자의 모든 리뷰와 관련 책 정보를 가져옵니다.
 * @returns {Promise<{ data: ReviewWithBook[] | null, error?: any }>} 리뷰 목록 또는 에러 객체
 */
export const fetchUserReviews = async (): Promise<{ data: ReviewWithBook[] | null, error?: any }> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { data: null, error: new Error('사용자 인증 정보가 없습니다.') };
  }

  try {
    // reviews 테이블에서 user_id가 일치하는 데이터를 조회하고,
    // books 테이블과 조인하여 책의 title, author, image_url을 함께 가져옵니다.
    // Supabase에서 reviews.isbn과 books.isbn 간의 외래 키 관계가 설정되어 있어야 합니다.
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, isbn, user_id, progress, rating, start_date, end_date, review, created_at,
        books ( title, author, image_url )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // 최신순으로 정렬 (선택 사항)

    if (error) {
      console.error('사용자 리뷰 조회 오류:', error);
      return { data: null, error };
    }

    console.log('사용자 리뷰 조회 성공:', data);
    // 타입 단언 사용 (데이터 구조가 일치한다고 가정, books가 배열일 수 있음에 유의)
    // 실제 반환 타입에 맞춰 조정 필요
    return { data: data as unknown as ReviewWithBook[] };

  } catch (err) {
    console.error('fetchUserReviews 함수 처리 중 예외 발생:', err);
    return { data: null, error: err };
  }
};

/**
 * 특정 리뷰의 정보를 업데이트합니다.
 * @param reviewId 업데이트할 리뷰의 ID
 * @param updates 업데이트할 데이터 객체 (progress, rating, start_date, end_date, review)
 * @returns {Promise<{ success: boolean, error?: any }>} 업데이트 성공 여부와 에러 객체
 */
export const updateReview = async (reviewId: number, updates: Partial<Omit<ReadingRecordData, 'user_id' | 'isbn' | 'title' | 'authors' | 'image_url'>>) => {
  console.log(`Supabase 리뷰 업데이트 시도: ID ${reviewId}`, updates);

  if (!reviewId) {
    console.error('업데이트 실패: 리뷰 ID 누락');
    return { success: false, error: new Error('리뷰 ID가 필요합니다.') };
  }

  try {
    const { error } = await supabase
      .from('reviews')
      .update({
        progress: updates.progress,
        rating: updates.rating,
        start_date: updates.start_date,
        end_date: updates.end_date,
        review: updates.review,
        // updated_at: new Date().toISOString() // 필요시 업데이트 시간 기록
      })
      .eq('id', reviewId);

    if (error) {
      console.error('Reviews 테이블 업데이트 오류:', error);
      return { success: false, error };
    }

    console.log(`Reviews 테이블 업데이트 성공: ID ${reviewId}`);
    return { success: true };

  } catch (err) {
    console.error('updateReview 함수 처리 중 예외 발생:', err);
    return { success: false, error: err };
  }
};

/**
 * 특정 리뷰를 삭제합니다.
 * @param reviewId 삭제할 리뷰의 ID
 * @returns {Promise<{ success: boolean, error?: any }>} 삭제 성공 여부와 에러 객체
 */
export const deleteReview = async (reviewId: number) => {
  console.log(`Supabase 리뷰 삭제 시도: ID ${reviewId}`);

  if (!reviewId) {
    console.error('삭제 실패: 리뷰 ID 누락');
    return { success: false, error: new Error('리뷰 ID가 필요합니다.') };
  }

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Reviews 테이블 삭제 오류:', error);
      return { success: false, error };
    }

    console.log(`Reviews 테이블 삭제 성공: ID ${reviewId}`);
    return { success: true };

  } catch (err) {
    console.error('deleteReview 함수 처리 중 예외 발생:', err);
    return { success: false, error: err };
  }
};

/**
 * 오늘의 독서 기록을 추가합니다.
 * 이미 오늘 날짜로 기록이 존재하면, 오류를 발생시켜 중복 기록을 방지합니다.
 * (count를 계속 증가시키는 기능은 다른 함수/버튼으로 분리 예정)
 */
export const upsertTodaysReadingLog = async () => {
  // 1. 현재 사용자 ID 가져오기
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error fetching user or user not logged in:', userError);
    throw new Error('사용자 인증에 실패했습니다. 로그인이 필요합니다.');
  }
  const userId = user.id;

  // 2. 오늘 날짜를 'YYYY-MM-DD' 형식으로 생성
  const today = new Date().toISOString().split('T')[0];

  // 3. 오늘 날짜로 이미 기록이 있는지 확인
  const { data: existingLog, error: selectError } = await supabase
    .from('reading_logs')
    .select('id') // 존재 여부만 확인하면 되므로 id만 가져옴
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle(); // 결과가 없으면 null, 있으면 객체

  if (selectError) {
    console.error("Error checking for existing reading log:", selectError);
    throw selectError; // DB 조회 오류
  }

  if (existingLog) {
    // 이미 오늘 날짜로 기록이 존재하면, 오류를 발생시켜 UI에서 처리하도록 함
    console.log(`Reading log for user ${userId} on ${today} already exists.`);
    throw new Error('오늘의 독서 기록이 이미 존재합니다.');
  }

  // 4. 오늘 날짜 기록이 없으면 새로 삽입 (count는 1로 시작)
  const { error: insertError } = await supabase
    .from('reading_logs')
    .insert([{ user_id: userId, date: today, count: 1 }]);

  if (insertError) {
    console.error("Error inserting new reading log:", insertError);
    throw insertError; // DB 삽입 오류
  }

  console.log(`Successfully inserted reading log for user ${userId} on ${today}.`);
  // 성공 시 특별한 반환값 없음 (void)
};

/**
 * 특정 날짜의 독서 시간을 기록하거나 업데이트합니다.
 * 이미 해당 날짜에 기록이 존재하면, 기존 count에 새로운 시간을 더합니다.
 * @param durationInMinutes 기록할 독서 시간 (분 단위)
 * @returns {Promise<void>} 성공 시 void, 실패 시 에러 발생
 */
export const upsertReadingDurationLog = async (durationInMinutes: number): Promise<void> => {
  // 0분 이하면 기록하지 않음
  if (durationInMinutes <= 0) {
    console.log('Reading duration is 0 or less, skipping log.');
    return;
  }

  // 1. 현재 사용자 ID 가져오기
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error fetching user or user not logged in:', userError);
    throw new Error('사용자 인증에 실패했습니다. 로그인이 필요합니다.');
  }
  const userId = user.id;

  // 2. 오늘 날짜를 'YYYY-MM-DD' 형식으로 생성
  const today = new Date().toISOString().split('T')[0];

  // 3. 오늘 날짜로 이미 기록이 있는지 확인
  const { data: existingLog, error: selectError } = await supabase
    .from('reading_logs')
    .select('id, count')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (selectError) {
    console.error("Error checking for existing reading log:", selectError);
    throw selectError;
  }

  if (existingLog) {
    // 4. 오늘 날짜 기록이 있으면 count 업데이트 (기존 값 + 새로운 시간)
    const newCount = (existingLog.count || 0) + durationInMinutes;
    const { error: updateError } = await supabase
      .from('reading_logs')
      .update({ count: newCount })
      .eq('id', existingLog.id);

    if (updateError) {
      console.error("Error updating reading log:", updateError);
      throw updateError;
    }
    console.log(`Successfully updated reading log for user ${userId} on ${today}. New count: ${newCount}`);
  } else {
    // 5. 오늘 날짜 기록이 없으면 새로 삽입
    const { error: insertError } = await supabase
      .from('reading_logs')
      .insert([{ user_id: userId, date: today, count: durationInMinutes }]);

    if (insertError) {
      console.error("Error inserting new reading log:", insertError);
      throw insertError;
    }
    console.log(`Successfully inserted new reading log for user ${userId} on ${today} with count: ${durationInMinutes}.`);
  }
};

export interface ReadingLogDataForGraph {
  date: Date; // string 대신 Date 객체 사용
  count: number;
}

/**
 * 현재 로그인된 사용자의 모든 독서 기록을 ContributionGraph용으로 가져옵니다.
 * @returns {Promise<ReadingLogDataForGraph[]>} ContributionGraph에 적합한 데이터 배열
 */
export const getReadingLogsForContributionGraph = async (): Promise<ReadingLogDataForGraph[]> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Error fetching user or user not logged in for graph data:', userError);
    throw new Error('사용자 인증에 실패했습니다. 로그인이 필요합니다.');
  }
  const userId = user.id;

  const { data, error } = await supabase
    .from('reading_logs')
    .select('date, count')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching reading logs for graph:', error);
    throw error;
  }

  // 데이터를 ContributionGraph가 기대하는 형태로 매핑 (count -> value, string -> Date)
  const mappedData: ReadingLogDataForGraph[] = (data || []).map(log => ({
    date: new Date(log.date), // YYYY-MM-DD 문자열을 Date 객체로 변환
    count: log.count,
  }));

  return mappedData;
};

/**
 * 회원 탈퇴를 위한 Supabase Edge Function 호출을 요청합니다.
 * 실제 삭제 로직은 'delete-user' Edge Function에서 처리됩니다.
 * @returns {Promise<{ success: boolean, error?: any }>} 요청 성공 여부와 에러 객체
 */
export const requestAccountDeletion = async (): Promise<{ success: boolean, error?: any }> => {
  console.log('Supabase 회원 탈퇴 요청 시도');

  try {
    // 'delete-user'는 실제 구현된 Edge Function의 이름이어야 합니다.
    const { error } = await supabase.functions.invoke('delete-user');

    if (error) {
      console.error('회원 탈퇴 Edge Function 호출 오류:', error);
      // Edge Function에서 반환한 구체적인 오류 메시지를 포함할 수 있습니다.
      return { success: false, error: new Error(error.message || '회원 탈퇴 처리 중 서버 오류가 발생했습니다.') };
    }

    console.log('회원 탈퇴 요청 성공');
    return { success: true };

  } catch (err: any) { // catch 블록에서 err 타입을 명시적으로 any 또는 Error로 지정
    console.error('requestAccountDeletion 함수 처리 중 예외 발생:', err);
    // 네트워크 오류 등 invoke 자체의 실패일 수 있습니다.
    // err 객체가 message 속성을 가지고 있는지 확인
    const errorMessage = err?.message || '회원 탈퇴 요청 중 알 수 없는 오류가 발생했습니다.';
    return { success: false, error: new Error(errorMessage) };
  }
};

// ArticleScreen에서 사용할 Post 상세 정보 타입
export interface PostDetail {
  id: string; 
  created_at: string;
  content: string | null;
  updated_at: string | null;
  views: number | null;
  likes_count: number | null; // 실제 컬럼명 likes_count를 사용
  user_id: string;
  isbn: string | null;
  isLiked: boolean; 
  books: { 
    title: string | null;
    image_url: string | null;
    author: string | null; 
  } | null;
  users: { 
    nickname: string | null;
  } | null;
}

interface UserLikeRecordForDetail { // HomeScreen의 UserLikeRecord와 동일하게 사용 가능
  user_id: string;
}

export const fetchPostDetailsById = async (postId: string): Promise<{ data: PostDetail | null, error?: any }> => {
  if (!postId) {
    return { data: null, error: new Error('게시글 ID가 필요합니다.') };
  }

  try {
    // 먼저 현재 게시글의 조회수와 좋아요 수를 가져옴 (업데이트 전 값)
    const { data: initialPostState, error: fetchInitialError } = await supabase
      .from('posts')
      .select('views, likes_count')
      .eq('id', postId)
      .single();

    if (fetchInitialError) {
      console.error('게시글 초기 상태(조회수/좋아요) 가져오기 오류:', fetchInitialError);
      // 오류가 발생해도 계속 진행하되, 이 값들은 null일 수 있음을 인지
    }

    const currentViews = initialPostState?.views || 0;
    const newViews = currentViews + 1;

    // 조회수 업데이트
    const { error: updateViewsError } = await supabase
      .from('posts')
      .update({ views: newViews })
      .eq('id', postId);

    if (updateViewsError) {
      console.error('게시글 조회수 업데이트 오류:', updateViewsError);
      // 조회수 업데이트 실패는 치명적이지 않을 수 있으므로 로깅 후 계속 진행
    }

    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        created_at,
        content,
        updated_at,
        views, 
        likes_count, 
        user_id,
        isbn,
        books (title, image_url, author),
        users (nickname),
        user_like_records:likes!left (
          user_id
        )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      // 이 에러는 심각하므로 바로 반환
      console.error(`ID가 ${postId}인 게시글 조회 오류 (Supabase):`, JSON.stringify(error, null, 2));
      return { data: null, error };
    }

    if (!data) {
      return { data: null, error: new Error('게시글을 찾을 수 없습니다.') };
    }

    interface FetchedPostDetails {
        id: string; created_at: string; content: string | null; updated_at: string | null;
        views: number | null; likes_count: number | null; user_id: string; isbn: string | null;
        books: { title: string | null; image_url: string | null; author: string | null; } | null;
        users: { nickname: string | null; } | null;
        user_like_records: UserLikeRecordForDetail[] | null;
    }

    // 타입 단언 수정: unknown을 거쳐서 타입 변환
    const fetchedData = data as unknown as FetchedPostDetails;

    // 매핑 로직 수정: .length 와 [0] 접근 제거
    const book = fetchedData.books ? fetchedData.books : null;
    const authorUser = fetchedData.users ? fetchedData.users : null;
    const isLiked = !!(currentUserId && fetchedData.user_like_records && fetchedData.user_like_records.some(like => like.user_id === currentUserId));

    const mappedPost: PostDetail = {
      id: fetchedData.id,
      created_at: fetchedData.created_at,
      content: fetchedData.content,
      updated_at: fetchedData.updated_at,
      views: newViews, // 업데이트 시도한 조회수 (또는 fetchedData.views)
      likes_count: fetchedData.likes_count, // 서버에서 직접 가져온 최신 좋아요 수
      user_id: fetchedData.user_id,
      isbn: fetchedData.isbn,
      books: book,
      users: authorUser,
      isLiked: isLiked,
    };

    return { data: mappedPost, error: null };

  } catch (err: any) {
    console.error(`fetchPostDetailsById (${postId}) 함수 내부에서 예외 발생:`, JSON.stringify(err, null, 2));
    return { data: null, error: err };
  }
};

/**
 * 게시물에 좋아요를 추가합니다.
 * @param postId 좋아요를 추가할 게시물의 ID
 * @param userId 좋아요를 누른 사용자의 ID
 * @returns {Promise<{ success: boolean, error?: any }>} 작업 성공 여부 및 에러 객체
 */
export const addLike = async (postId: string, userId: string): Promise<{ success: boolean, error?: any }> => {
  if (!postId || !userId) {
    return { success: false, error: new Error('게시물 ID와 사용자 ID가 모두 필요합니다.') };
  }
  try {
    const { error } = await supabase
      .from('likes')
      .insert([{ post_id: postId, user_id: userId }]);
    if (error) {
      // 좋아요 중복 시 발생하는 유니크 제약 조건 위반 (코드: '23505')은 에러로 간주하지 않을 수 있음
      // 여기서는 모든 DB 에러를 실패로 처리
      console.error('좋아요 추가 오류:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error('addLike 함수 처리 중 예외 발생:', err);
    return { success: false, error: err };
  }
};

/**
 * 게시물에서 좋아요를 제거합니다.
 * @param postId 좋아요를 제거할 게시물의 ID
 * @param userId 좋아요를 취소하는 사용자의 ID
 * @returns {Promise<{ success: boolean, error?: any }>} 작업 성공 여부 및 에러 객체
 */
export const removeLike = async (postId: string, userId: string): Promise<{ success: boolean, error?: any }> => {
  if (!postId || !userId) {
    return { success: false, error: new Error('게시물 ID와 사용자 ID가 모두 필요합니다.') };
  }
  try {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) {
      console.error('좋아요 제거 오류:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error('removeLike 함수 처리 중 예외 발생:', err);
    return { success: false, error: err };
  }
};

/**
 * 현재 로그인된 사용자의 닉네임을 가져옵니다.
 * @returns {Promise<string | null>} 사용자의 닉네임 또는 null (로그인되지 않았거나 오류 발생 시)
 */
export const getUserNickname = async (): Promise<string | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user or user not logged in:', userError);
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('nickname')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user nickname:', error);
      return null;
    }

    return data?.nickname || null;
  } catch (err) {
    console.error('getUserNickname function error:', err);
    return null;
  }
};

/**
 * 사용자의 닉네임 변경 가능 여부를 확인합니다.
 * @returns {Promise<{ canUpdate: boolean, message?: string }>} 변경 가능 여부와 메시지
 */
export const checkNicknameUpdateAvailability = async (): Promise<{ canUpdate: boolean, message?: string }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { canUpdate: false, message: '사용자 인증에 실패했습니다.' };
    }

    const { data, error } = await supabase
      .from('users')
      .select('last_profile_update_at')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking nickname update availability:', error);
      return { canUpdate: false, message: '닉네임 변경 가능 여부를 확인하는 중 오류가 발생했습니다.' };
    }

    // last_profile_update_at이 null이면 변경 가능
    if (!data.last_profile_update_at) {
      return { canUpdate: true };
    }

    // 마지막 업데이트로부터 한 달이 지났는지 확인
    const lastUpdate = new Date(data.last_profile_update_at);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (lastUpdate < oneMonthAgo) {
      return { canUpdate: true };
    }

    // 다음 변경 가능 날짜 계산
    const nextUpdateDate = new Date(lastUpdate);
    nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 1);
    
    return { 
      canUpdate: false, 
      message: `다음 닉네임 변경은 ${nextUpdateDate.toLocaleDateString()}부터 가능합니다.` 
    };
  } catch (err) {
    console.error('checkNicknameUpdateAvailability function error:', err);
    return { canUpdate: false, message: '닉네임 변경 가능 여부를 확인하는 중 오류가 발생했습니다.' };
  }
};

/**
 * 사용자의 닉네임을 업데이트합니다.
 * @param newNickname 새로운 닉네임
 * @returns {Promise<{ success: boolean, error?: any }>} 업데이트 성공 여부와 에러 객체
 */
export const updateUserNickname = async (newNickname: string): Promise<{ success: boolean, error?: any }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: new Error('사용자 인증에 실패했습니다.') };
    }

    const { error } = await supabase
      .from('users')
      .update({ 
        nickname: newNickname,
        last_profile_update_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating nickname:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('updateUserNickname function error:', err);
    return { success: false, error: err };
  }
};