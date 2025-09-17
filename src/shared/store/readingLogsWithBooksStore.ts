import { create } from 'zustand';
import { ReadingLogWithBook } from '@libs/supabase/reading_logs';
import { getUserReadingLogsWithBookInfo } from '@libs/supabase/reading_logs';
import { supabase } from '@libs/supabase/supabase';

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
  sortReadingLogsByDate: (ascending?: boolean) => void; // finished_at > created_at 기준
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
      // 세션 확인: 로그인 상태가 아니면 조용히 중단
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        set({ isLoading: false, error: null });
        return;
      }

      // 요청한 사용자와 세션 사용자 일치 확인
      if (session.user.id !== userId) {
        set({ isLoading: false, error: '권한이 없습니다.' });
        return;
      }

      const logs = await getUserReadingLogsWithBookInfo(userId);
      set({ 
        readingLogs: logs,
        isLoading: false 
      });
      // 가져온 후 최신순으로 정렬 보장
      get().sortReadingLogsByDate(false);
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
    // 추가 후 최신순 정렬
    get().sortReadingLogsByDate(false);
  },

  // 독서 기록 수정
  updateReadingLog: (logId: string, updates: Partial<ReadingLogWithBook>) => {
    set((state) => ({
      readingLogs: state.readingLogs.map(log => 
        log.id === logId ? { ...log, ...updates } : log
      )
    }));
    // 수정 후 최신순 정렬
    get().sortReadingLogsByDate(false);
  },

  // 독서 기록 삭제
  removeReadingLog: (logId: string) => {
    set((state) => ({
      readingLogs: state.readingLogs.filter(log => log.id !== logId)
    }));
    // 삭제 후 최신순 정렬 유지 (안전성)
    get().sortReadingLogsByDate(false);
  },

  // 날짜 기준 재정렬 (기본: 최신순)
  sortReadingLogsByDate: (ascending = false) => {
    const direction = ascending ? 1 : -1;
    set((state) => ({
      readingLogs: [...state.readingLogs].sort((a, b) => {
        const aFinished = a.finished_at ? Date.parse(a.finished_at) : null;
        const bFinished = b.finished_at ? Date.parse(b.finished_at) : null;

        // finished_at 우선 비교 (완료된 기록이 위쪽)
        if (aFinished !== null && bFinished !== null) {
          if (aFinished !== bFinished) return (aFinished - bFinished) * direction;
        } else if (aFinished !== null || bFinished !== null) {
          // 하나만 finished_at이 있는 경우: finished_at이 있는 쪽을 우선
          return aFinished !== null ? -1 * direction : 1 * direction;
        }

        // 둘 다 finished_at 없거나 동일한 경우 created_at 비교
        const aCreated = Date.parse(a.created_at);
        const bCreated = Date.parse(b.created_at);
        if (aCreated !== bCreated) return (aCreated - bCreated) * direction;
        return 0;
      })
    }));
  },
}));

// 인증 상태 변화에 따라 스토어를 정리한다.
// 세션이 사라지면(로그아웃) 목록과 에러, 로딩 상태를 초기화한다.
supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) {
    useReadingLogsWithBooksStore.setState({
      readingLogs: [],
      isLoading: false,
      error: null,
    });
  }
});

// 편의성 훅들
export const useReadingLogs = () => useReadingLogsWithBooksStore(state => state.readingLogs);
export const useIsReadingLogsLoading = () => useReadingLogsWithBooksStore(state => state.isLoading);
export const useReadingLogsError = () => useReadingLogsWithBooksStore(state => state.error);
export const useFetchReadingLogs = () => useReadingLogsWithBooksStore(state => state.fetchReadingLogs);
export const useAddReadingLog = () => useReadingLogsWithBooksStore(state => state.addReadingLog);
export const useUpdateReadingLog = () => useReadingLogsWithBooksStore(state => state.updateReadingLog);
export const useRemoveReadingLog = () => useReadingLogsWithBooksStore(state => state.removeReadingLog);
export const useSortReadingLogsByDate = () => useReadingLogsWithBooksStore(state => state.sortReadingLogsByDate);
