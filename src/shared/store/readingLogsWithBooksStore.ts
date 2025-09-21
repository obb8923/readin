import { create } from 'zustand';
import { ReadingLogWithBook } from '@libs/supabase/reading_logs';
import { getUserReadingLogsWithBookInfo } from '@libs/supabase/reading_logs';
import { supabase } from '@libs/supabase/supabase';

// 중간점수 계산 유틸리티 함수
const calculateMedianScore = (readingLogs: ReadingLogWithBook[]): number | null => {
  if (readingLogs.length === 0) return null;
  
  const scores = readingLogs
    .map(log => log.rate)
    .filter(rate => rate != null)
    .sort((a, b) => a - b);
  
  if (scores.length === 0) return null;
  
  const mid = Math.floor(scores.length / 2);
  return scores.length % 2 === 0 
    ? (scores[mid - 1] + scores[mid]) / 2 
    : scores[mid];
};

interface ReadingLogsState {
  // 상태
  readingLogs: ReadingLogWithBook[];
  medianScore: number | null;
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
  medianScore: null,
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
      const medianScore = calculateMedianScore(logs);
      set({ 
        readingLogs: logs,
        medianScore,
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
    set((state) => {
      const newReadingLogs = [log, ...state.readingLogs];
      const medianScore = calculateMedianScore(newReadingLogs);
      return {
        readingLogs: newReadingLogs,
        medianScore
      };
    });
    // 추가 후 최신순 정렬
    get().sortReadingLogsByDate(false);
  },

  // 독서 기록 수정
  updateReadingLog: (logId: string, updates: Partial<ReadingLogWithBook>) => {
    set((state) => {
      const newReadingLogs = state.readingLogs.map(log => 
        log.id === logId ? { ...log, ...updates } : log
      );
      const medianScore = calculateMedianScore(newReadingLogs);
      return {
        readingLogs: newReadingLogs,
        medianScore
      };
    });
    // 수정 후 최신순 정렬
    get().sortReadingLogsByDate(false);
  },

  // 독서 기록 삭제
  removeReadingLog: (logId: string) => {
    set((state) => {
      const newReadingLogs = state.readingLogs.filter(log => log.id !== logId);
      const medianScore = calculateMedianScore(newReadingLogs);
      return {
        readingLogs: newReadingLogs,
        medianScore
      };
    });
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
      medianScore: null,
      isLoading: false,
      error: null,
    });
  }
});

// 점수 통계 계산 함수
const calculateScoreStats = (readingLogs: ReadingLogWithBook[]) => {
  const validLogs = readingLogs.filter(log => log.rate != null);
  const scores = validLogs.map(log => log.rate as number);
  
  if (scores.length === 0) {
    return {
      count: 0,
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      distribution: {},
      medianBook: null,
      minBook: null,
      maxBook: null
    };
  }

  const sortedLogs = [...validLogs].sort((a, b) => (a.rate as number) - (b.rate as number));
  const sortedScores = [...scores].sort((a, b) => a - b);
  const count = scores.length;
  const average = scores.reduce((sum, score) => sum + score, 0) / count;
  const median = count % 2 === 0 
    ? (sortedScores[count / 2 - 1] + sortedScores[count / 2]) / 2
    : sortedScores[Math.floor(count / 2)];
  const min = Math.min(...scores);
  const max = Math.max(...scores);

  // 중간점수, 최저점수, 최고점수에 해당하는 책 찾기
  const medianBook = count % 2 === 0 
    ? sortedLogs[Math.floor(count / 2) - 1]?.book || null
    : sortedLogs[Math.floor(count / 2)]?.book || null;
  
  const minBook = sortedLogs.find(log => log.rate === min)?.book || null;
  const maxBook = sortedLogs.find(log => log.rate === max)?.book || null;

  // 점수 분포 계산 (10점 단위)
  const distribution: Record<string, number> = {};
  for (let i = 0; i <= 100; i += 10) {
    const range = `${i}-${i + 9}`;
    distribution[range] = scores.filter(score => score >= i && score < i + 10).length;
  }
  // 100점은 별도 처리
  distribution['100'] = scores.filter(score => score === 100).length;

  return {
    count,
    average: Math.round(average * 10) / 10, // 소수점 첫째자리까지
    median: Math.round(median * 10) / 10,
    min,
    max,
    distribution,
    medianBook,
    minBook,
    maxBook
  };
};

// 편의성 훅들
export const useReadingLogs = () => useReadingLogsWithBooksStore(state => state.readingLogs);
export const useMedianScore = () => useReadingLogsWithBooksStore(state => state.medianScore);
export const useIsReadingLogsLoading = () => useReadingLogsWithBooksStore(state => state.isLoading);
export const useReadingLogsError = () => useReadingLogsWithBooksStore(state => state.error);
export const useFetchReadingLogs = () => useReadingLogsWithBooksStore(state => state.fetchReadingLogs);
export const useAddReadingLog = () => useReadingLogsWithBooksStore(state => state.addReadingLog);
export const useUpdateReadingLog = () => useReadingLogsWithBooksStore(state => state.updateReadingLog);
export const useRemoveReadingLog = () => useReadingLogsWithBooksStore(state => state.removeReadingLog);
export const useSortReadingLogsByDate = () => useReadingLogsWithBooksStore(state => state.sortReadingLogsByDate);
export const useGetScoreStats = () => {
  const readingLogs = useReadingLogsWithBooksStore(state => state.readingLogs);
  return calculateScoreStats(readingLogs);
};
