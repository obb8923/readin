import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fetchUserReviews, ReviewWithBook } from '../libs/supabase/supabaseOperations';

interface ReviewState {
  reviews: ReviewWithBook[];
  isLoading: boolean;
  error: any | null;
  fetchReviews: () => Promise<void>;
  // SectionList에 사용할 수 있는 형태로 가공된 데이터를 반환하는 getter 추가
  getGroupedReviews: () => Array<{ title: string; data: ReviewWithBook[] }>;
  // 여기에 월별 그룹화된 리뷰를 저장할 상태나, 통계 계산 함수를 추가할 수도 있습니다.
  // 예를 들어, getMonthlyStats: () => MonthlyStatsType[];
}

import { StateCreator } from 'zustand';

const reviewStoreCreator: StateCreator<ReviewState> = (set, get) => ({
  reviews: [],
  isLoading: false,
  error: null,
  fetchReviews: async () => {
    if (get().isLoading) return; // 이미 로딩 중이면 중복 실행 방지
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await fetchUserReviews();
      if (error) {
        throw error;
      }
      if (data) {
        set({ reviews: data, isLoading: false });
      } else {
        set({ reviews: [], isLoading: false }); // 데이터가 null일 경우 빈 배열로 설정
      }
    } catch (err) {
      console.error("Error fetching reviews in store:", err);
      set({ error: err, isLoading: false });
    }
  },
  getGroupedReviews: () => {
    const reviews = get().reviews;
    if (!reviews || reviews.length === 0) return [];

    const grouped: { [key: string]: ReviewWithBook[] } = {};
    const noEndDateReviews: ReviewWithBook[] = [];

    reviews.forEach(review => {
      if (review.end_date) {
        try {
          const endDate = new Date(review.end_date);
          // const yearMonth = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}`;
          // 현지 시간 기준으로 년-월을 가져오도록 수정 (Date 객체 생성 시 UTC 기준으로 해석될 수 있는 문제 방지)
          const year = endDate.getUTCFullYear(); // 또는 getFullYear() - 타임존 설정에 따라 다를 수 있음
          const month = endDate.getUTCMonth() + 1; // 또는 getMonth() + 1
          const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;

          if (!grouped[yearMonth]) {
            grouped[yearMonth] = [];
          }
          grouped[yearMonth].push(review);
        } catch (e) {
          console.error("Invalid date format for review:", review.id, review.end_date, e);
          noEndDateReviews.push(review); // 날짜 형식이 잘못된 경우도 별도 처리
        }
      } else {
        noEndDateReviews.push(review);
      }
    });

    // SectionList 데이터 형태로 변환 (최신 월 순으로 정렬)
    const sections = Object.keys(grouped)
      .sort()
      .reverse() // 최신 월이 위로 오도록 정렬
      .map(yearMonth => {
        const [year, month] = yearMonth.split('-');
        return {
          title: `${year}년 ${parseInt(month, 10)}월`,
          data: grouped[yearMonth].sort((a, b) => new Date(b.end_date!).getTime() - new Date(a.end_date!).getTime()), // 각 섹션 내에서도 최신순 정렬
        };
      });

    if (noEndDateReviews.length > 0) {
      sections.push({
        title: "완독일 미지정",
        data: noEndDateReviews.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), // 생성일 기준 최신순 정렬
      });
    }
    return sections;
  },
});

const useReviewStore = create<ReviewState>()(devtools(reviewStoreCreator));

export default useReviewStore; 