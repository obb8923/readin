import { create } from 'zustand';
import { StorageService } from '../services/storageService';

interface FirstVisitStore {
  // 상태
  isFirstVisit: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 액션들
  checkFirstVisit: () => Promise<void>;
  setFirstVisitCompleted: () => Promise<void>;
  resetFirstVisit: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFirstVisitStore = create<FirstVisitStore>((set, get) => ({
  // 초기 상태
  isFirstVisit: true, // 기본값은 첫 방문으로 설정
  isLoading: false,
  error: null,
  
  // 첫 방문 여부 확인
  checkFirstVisit: async () => {
    try {
      set({ isLoading: true, error: null });
      const isFirst = await StorageService.isFirstVisit();
      set({ isFirstVisit: isFirst, isLoading: false });
    } catch (error) {
      console.error('첫 방문 확인 중 오류:', error);
      set({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        isLoading: false 
      });
    }
  },
  
  // 첫 방문 완료 처리
  setFirstVisitCompleted: async () => {
    try {
      set({ isLoading: true, error: null });
      await StorageService.setFirstVisitCompleted();
      set({ isFirstVisit: false, isLoading: false });
    } catch (error) {
      console.error('첫 방문 완료 처리 중 오류:', error);
      set({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        isLoading: false 
      });
    }
  },
  
  // 첫 방문 상태 초기화 (테스트용)
  resetFirstVisit: async () => {
    try {
      set({ isLoading: true, error: null });
      await StorageService.resetFirstVisit();
      set({ isFirstVisit: true, isLoading: false });
    } catch (error) {
      console.error('첫 방문 초기화 중 오류:', error);
      set({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        isLoading: false 
      });
    }
  },
  
  // 로딩 상태 설정
  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  // 에러 상태 설정
  setError: (error: string | null) => {
    set({ error });
  },
}));
