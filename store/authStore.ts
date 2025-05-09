import { create } from 'zustand';
import { supabase } from '../src/libs/supabase/supabase'; // Supabase 클라이언트 확인
import { Session, User } from '@supabase/supabase-js';

// 상태 타입 정의
interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean; // 초기 세션 로딩 상태
  setSession: (session: Session | null) => void;
  checkSession: () => Promise<void>; // 세션 확인 및 리스너 초기화 함수
  _listenerInitialized: boolean; // 리스너 중복 초기화 방지 플래그
}

// Zustand 스토어 생성
export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true, // 초기 상태는 로딩 중
  _listenerInitialized: false,

  // 세션 상태 업데이트 액션
  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },

  // 세션 확인 및 리스너 초기화 함수
  checkSession: async () => {
    // 이미 로딩 완료되었으면 실행 안 함 (앱 재시작 등 예외 케이스)
    if (!get().loading && get().session !== undefined) return;

    console.log("initial session 확인 시작");
    set({ loading: true }); // 명시적으로 로딩 시작
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      console.log("Initial session 결과:", session ? "Session 존재" : "Session 없음");
      set({ session, user: session?.user ?? null, loading: false });

      // 리스너 초기화 (한 번만 실행)
      if (!get()._listenerInitialized) {
          console.log("auth state 리스너 초기화 시작");
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("Auth state changed via listener:", _event, session ? "New session" : "No session");
            set({ session, user: session?.user ?? null });
          });
          set({ _listenerInitialized: true });

          // 앱 상태 변경 시 세션 갱신 (옵션: 백그라운드에서 돌아왔을 때 등)
          // AppState.addEventListener('change', (nextAppState) => {
          //   if (nextAppState === 'active') {
          //     supabase.auth.getSession(); // 세션 갱신 시도
          //   }
          // });
          
          // 구독 정리 로직 필요 시 (예: 앱 종료 시) 리스너 반환값 사용
          // 예: return () => subscription?.unsubscribe(); (Zustand 미들웨어 등 필요)
      }

    } catch (error) {
      console.error("Error checking session:", error);
      set({ session: null, user: null, loading: false }); // 오류 발생 시 로그아웃 상태로 처리
    } 
  },
}));

// 앱 시작 시 스토어 초기화 (옵션: _layout.tsx 에서 호출하는 대신 여기에 배치 가능)
// console.log("Initializing auth store and checking session...");
// useAuthStore.getState().checkSession(); 