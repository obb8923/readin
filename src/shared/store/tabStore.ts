import { create } from 'zustand';
import { TAB_NAME } from '@/shared/constant/tab';
import { supabase } from '@/shared/libs/supabase/supabase';
// 탭 이름 타입 정의
export type TabName = typeof TAB_NAME[keyof typeof TAB_NAME];

// 탭 스토어 인터페이스
interface TabStore {
  // 현재 활성화된 탭
  activeTab: TabName;
  // 탭바 표시 여부
  isTabBarVisible: boolean;
  // 탭 이동
  setActiveTab: (tab: TabName) => void;
  // 탭바 표시
  showTabBar: () => void;
  // 탭바 숨김
  hideTabBar: () => void;
  // 탭바 표시 상태 토글
  toggleTabBar: () => void;
}

// Zustand 스토어 생성
export const useTabStore = create<TabStore>((set) => ({
  // 초기 상태
  activeTab: TAB_NAME.HOME,
  isTabBarVisible: true,

  // 탭 이동
  setActiveTab: (tab: TabName) => {
    set({ activeTab: tab });
  },

  // 탭바 표시
  showTabBar: () => {
    set({ isTabBarVisible: true });
  },

  // 탭바 숨김
  hideTabBar: () => {
    set({ isTabBarVisible: false });
  },

  // 탭바 표시 상태 토글
  toggleTabBar: () => {
    set((state) => ({ isTabBarVisible: !state.isTabBarVisible }));
  },
}));

// 편의성 훅들
export const useActiveTab = () => useTabStore(state => state.activeTab);
export const useSetActiveTab = () => useTabStore(state => state.setActiveTab);
export const useIsTabBarVisible = () => useTabStore(state => state.isTabBarVisible);
export const useShowTabBar = () => useTabStore(state => state.showTabBar);
export const useHideTabBar = () => useTabStore(state => state.hideTabBar);
export const useToggleTabBar = () => useTabStore(state => state.toggleTabBar);

// 인증 상태 변화에 따라 탭을 초기화한다.
// 세션이 사라지면(로그아웃) 항상 HOME 탭으로 전환한다.
supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) {
    useTabStore.setState({
      activeTab: TAB_NAME.HOME,
      isTabBarVisible: true,
    });
  }
});