import { create } from 'zustand';
import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SUPABASE_WEB_CLIENT_KEY, SUPABASE_IOS_CLIENT_KEY } from '@env';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import { useAuthStore } from './authStore';
import { useFirstVisitStore } from './firstVisitStore';
import { useReadingLogsWithBooksStore } from './readingLogsWithBooksStore';

interface AppInitStore {
  // 상태
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  
  // 액션
  initializeApp: () => Promise<void>;
  reset: () => void;
}

export const useAppInitStore = create<AppInitStore>((set, get) => ({
  // 초기 상태
  isInitialized: false,
  isInitializing: false,
  error: null,
  
  // 앱 초기화 함수
  initializeApp: async () => {
    // 이미 초기화 중이거나 완료된 경우 중복 실행 방지
    if (get().isInitializing || get().isInitialized) {
      return;
    }
    
    set({ isInitializing: true, error: null });
    
    try {
      // 1. Google Sign-In 설정
      try {
        GoogleSignin.configure({
          webClientId: SUPABASE_WEB_CLIENT_KEY,
          iosClientId: SUPABASE_IOS_CLIENT_KEY,
          scopes: ['profile', 'email'],
        });
      } catch (error) {
        console.error('[AppInitStore] Google Sign-In configuration error:', error);
        // Google Sign-In 설정 실패는 치명적이지 않으므로 계속 진행
      }
      
      // 2. 첫 방문 확인
      const { checkFirstVisit } = useFirstVisitStore.getState();
      await checkFirstVisit();
      
      // 3. 로그인 상태 확인
      const { checkLoginStatus } = useAuthStore.getState();
      await checkLoginStatus();
      
      // 4. 로그인된 경우 독서 기록 가져오기
      const { isLoggedIn, userId } = useAuthStore.getState();
      if (isLoggedIn && userId) {
        const { fetchReadingLogs } = useReadingLogsWithBooksStore.getState();
        await fetchReadingLogs(userId);
      }

      // 5. Firebase Analytics 초기화 및 이벤트 로깅 설정
      try {
        const analytics = getAnalytics(getApp());
        logEvent(analytics, 'app_open' + Platform.OS + Date.now());
        if (__DEV__) console.log('[AppInitStore] Firebase Analytics initialized');
      } catch (error) {
        if (__DEV__) console.error('[AppInitStore] Error initializing analytics:', error);
      }
      
      set({ isInitialized: true, isInitializing: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '앱 초기화 중 오류가 발생했습니다.';
      console.error('[AppInitStore] 앱 초기화 실패:', error);
      set({ 
        error: errorMessage,
        isInitializing: false 
      });
    }
  },
  
  // 초기화 상태 리셋 (테스트용)
  reset: () => {
    set({ 
      isInitialized: false,
      isInitializing: false,
      error: null 
    });
  },
}));

