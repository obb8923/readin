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
  addReadingLog: (log: ReadingLogWithBook) => void;
  updateReadingLog: (logId: string, updates: Partial<ReadingLogWithBook>) => void;
  removeReadingLog: (logId: string) => void;
}

export const useReadingLogsWithBooksStore = create<ReadingLogsState>((set, get) => ({
  // 초기 상태
  readingLogs: [],
  isLoading: false,
  error: null,

  // 사용자의 모든 reading logs 가져오기 (책 정보 포함)
  fetchReadingLogs: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const logs = await getUserReadingLogsWithBookInfo(userId);
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

  // 새 독서 기록 추가
  addReadingLog: (log: ReadingLogWithBook) => {
    set((state) => ({
      readingLogs: [log, ...state.readingLogs]
    }));
  },

  // 독서 기록 수정
  updateReadingLog: (logId: string, updates: Partial<ReadingLogWithBook>) => {
    set((state) => ({
      readingLogs: state.readingLogs.map(log => 
        log.id === logId ? { ...log, ...updates } : log
      )
    }));
  },

  // 독서 기록 삭제
  removeReadingLog: (logId: string) => {
    set((state) => ({
      readingLogs: state.readingLogs.filter(log => log.id !== logId)
    }));
  },
}));

// 편의성 훅들
export const useReadingLogs = () => useReadingLogsWithBooksStore(state => state.readingLogs);
export const useIsReadingLogsLoading = () => useReadingLogsWithBooksStore(state => state.isLoading);
export const useReadingLogsError = () => useReadingLogsWithBooksStore(state => state.error);
export const useFetchReadingLogs = () => useReadingLogsWithBooksStore(state => state.fetchReadingLogs);
export const useAddReadingLog = () => useReadingLogsWithBooksStore(state => state.addReadingLog);
export const useUpdateReadingLog = () => useReadingLogsWithBooksStore(state => state.updateReadingLog);
export const useRemoveReadingLog = () => useReadingLogsWithBooksStore(state => state.removeReadingLog);
