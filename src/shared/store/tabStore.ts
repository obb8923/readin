import { create } from 'zustand';
import { TAB_NAME } from '@constants/tab';
// 탭 이름 타입 정의
export type TabName = typeof TAB_NAME[keyof typeof TAB_NAME];

// 탭 스토어 인터페이스
interface TabStore {
  // 현재 활성화된 탭
  activeTab: TabName;
  // 탭 이동
  setActiveTab: (tab: TabName) => void;
}

// Zustand 스토어 생성
export const useTabStore = create<TabStore>((set) => ({
  // 초기 상태
  activeTab: TAB_NAME.HOME,

  // 탭 이동
  setActiveTab: (tab: TabName) => {
    set({ activeTab: tab });
  },
}));

// 편의성 훅들
export const useActiveTab = () => useTabStore(state => state.activeTab);
export const useSetActiveTab = () => useTabStore(state => state.setActiveTab);