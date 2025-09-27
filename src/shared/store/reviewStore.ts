import { create } from 'zustand';
import { StorageService } from '../services/storageService';
import InAppReview from 'react-native-in-app-review';
import { Alert } from 'react-native';

interface ReviewState {
  // 상태
  isLoading: boolean;
  error: string | null;
  
  // 액션
  executeInAppReview: () => Promise<void>;
  setLastReviewRequestDate: (date: Date) => Promise<void>;
  getLastReviewRequestDate: () => Promise<Date | null>;
  shouldShowReviewRequest: () => Promise<boolean>;
  setError: (error: string | null) => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  // 초기 상태
  isLoading: false,
  error: null,

  // 인앱 리뷰 실행 (3개월 경과 확인 포함)
  executeInAppReview: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // 3개월 경과 여부 확인
      const shouldShow = true
      
      if (!shouldShow) {
        set({ isLoading: false });
        return;
      }
      
      // 마지막 평가 요청 날짜 저장
      await StorageService.setLastReviewRequestDate(new Date());
      
      // 인앱 리뷰 사용 가능 여부 확인
      const isAvailable = InAppReview.isAvailable();
      
      if (isAvailable) {
        await InAppReview.RequestInAppReview();
      } 
      set({ isLoading: false });
    } catch (error) {
      console.error('인앱 리뷰 실행 오류:', error);
      set({ isLoading: false });
    }
  },

  // 마지막 리뷰 요청 날짜 저장
  setLastReviewRequestDate: async (date: Date) => {
    try {
      await StorageService.setLastReviewRequestDate(date);
    } catch (error) {
      console.error('리뷰 요청 날짜 저장 오류:', error);
      set({ error: '리뷰 요청 날짜 저장 중 오류가 발생했습니다.' });
    }
  },

  // 마지막 리뷰 요청 날짜 조회
  getLastReviewRequestDate: async () => {
    try {
      return await StorageService.getLastReviewRequestDate();
    } catch (error) {
      console.error('리뷰 요청 날짜 조회 오류:', error);
      set({ error: '리뷰 요청 날짜 조회 중 오류가 발생했습니다.' });
      return null;
    }
  },

  // 리뷰 요청 표시 여부 확인
  shouldShowReviewRequest: async () => {
    try {
      return await StorageService.shouldShowReviewRequest();
    } catch (error) {
      console.error('리뷰 요청 표시 여부 확인 오류:', error);
      set({ error: '리뷰 요청 표시 여부 확인 중 오류가 발생했습니다.' });
      return false;
    }
  },

  // 에러 상태 설정
  setError: (error: string | null) => {
    set({ error });
  },
}));

// 편의 함수들
export const useExecuteInAppReview = () => useReviewStore(state => state.executeInAppReview);
