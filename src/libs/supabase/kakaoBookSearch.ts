// import Constants from 'expo-constants'; // Constants 제거
import { supabase } from './supabase'; // Supabase 클라이언트 import

interface KakaoBookSearchResponse {
  documents: any[]; 
  meta: {
    is_end: boolean;
    pageable_count: number;
    total_count: number;
  };
}

// 함수 이름은 유지하되, 내부 구현을 Edge Function 호출로 변경
export const searchBooks = async (query: string, page: number = 1, size: number = 10): Promise<KakaoBookSearchResponse> => {
  if (!query) {
    return { documents: [], meta: { is_end: true, pageable_count: 0, total_count: 0 } };
  }

  try {
    // Supabase Edge Function 호출
    const { data, error } = await supabase.functions.invoke('kakao-book-search', {
      // GET 방식으로 호출 시 query parameter 사용도 가능하나, POST body가 더 일반적
      // body: JSON.stringify({ query, page, size }) // 문자열화된 JSON 전달
      // 위 함수는 GET/POST 모두 query 파라미터를 받도록 되어 있으므로 아래 방식 사용 가능
       body: { query } // Edge Function에서 body.query로 접근
       // 만약 Edge Function에서 page, size도 처리하게 하려면 body에 추가:
       // body: { query, page, size }
    });

    if (error) {
      // Edge Function 호출 자체의 오류 (네트워크 등)
      console.error('Supabase Function invoke error:', error);
      throw error;
    }

    // Edge Function 내부에서 발생한 오류 (API 키 오류, 카카오 API 오류 등)
    // Edge Function에서 { error: '...' } 형태로 응답하도록 구현했음
    if (data && data.error) {
        console.error('Error from Edge Function:', data.error);
        throw new Error(data.error); 
    }

    // 성공 응답 데이터 반환 (Edge Function이 카카오 API 응답을 그대로 전달)
    return data as KakaoBookSearchResponse; 

  } catch (error) {
    console.error('Error during book search via Edge Function:', error);
    throw error; // 오류를 다시 던져서 호출하는 쪽에서 처리하도록 함
  }
}; 