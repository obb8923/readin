import { create } from 'zustand';
import { ReadingLogWithBook } from '@libs/supabase/reading_logs';
import { getUserReadingLogsWithBookInfo } from '@libs/supabase/reading_logs';

interface ReadingLogsState {
  // 상태
  readingLogs: ReadingLogWithBook[];
  isLoading: boolean;
  error: string | null;
  
  // 액션
  fetchReadingLogs: (userId: string) => Promise<void>;
}

export const useReadingLogsWithBooksStore = create<ReadingLogsState>((set, get) => ({
  // 초기 상태
  readingLogs: [],
  isLoading: false,
  error: null,

  // 사용자의 모든 reading logs 가져오기 (책 정보 포함)
  fetchReadingLogs: async (userId: string) => {
    console.log('[ReadingLogsStore] fetchReadingLogs 시작:', userId);
    set({ isLoading: true, error: null });
    try {
      const logs = await getUserReadingLogsWithBookInfo(userId);
      console.log('[ReadingLogsStore] 독서기록 가져오기 성공:', logs?.length || 0, '개');
      set({ 
        readingLogs: logs,
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '독서 기록을 가져오는데 실패했습니다.';
      console.error('[ReadingLogsStore] 독서기록 가져오기 실패:', error);
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },
}));

// 편의성 훅들
export const useReadingLogs = () => useReadingLogsWithBooksStore(state => state.readingLogs);
export const useIsReadingLogsLoading = () => useReadingLogsWithBooksStore(state => state.isLoading);
export const useReadingLogsError = () => useReadingLogsWithBooksStore(state => state.error);
export const useFetchReadingLogs = () => useReadingLogsWithBooksStore(state => state.fetchReadingLogs);
