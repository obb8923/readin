export interface ReadingLevel {
  limit: number; // mm 단위
  title: string;
}

// Map을 사용한 효율적인 레벨 저장
const READING_LEVELS_MAP = new Map<number, string>([
  [10, "동전"],
  [30, "마카롱"],
  [60, "머그컵"],
  [100, "햄스터"],
  [120, "컵라면"],
  [250, "고양이"],
  [300, "토스터기"],
  [400, "케이크"],
  [500, "리트리버"],
  [600, "베개"],
  [800, "수박"],
  [1000, "의자"],
  [1200, "판다"],
  [1500, "참치"],
  [1700, "호랑이"],
  [2000, "식탁"],
  [3000, "기린"]
]);

// 간단하고 직관적인 레벨 찾기 함수
export const getReadingLevel = (totalThickness: number): ReadingLevel => {
  // Map의 keys를 배열로 변환하고 정렬
  const limits = Array.from(READING_LEVELS_MAP.keys()).sort((a, b) => a - b);
  
  // 조건을 만족하는 가장 높은 limit 찾기
  let result = limits[0]; // 기본값
  
  for (const limit of limits) {
    if (limit <= totalThickness) {
      result = limit;
    } else {
      break; // 정렬되어 있으므로 더 이상 찾을 필요 없음
    }
  }

  return {
    limit: result,
    title: READING_LEVELS_MAP.get(result)!
  };
};
