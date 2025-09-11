import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_VISIT_KEY = 'readin:first_visit_completed';

export const StorageService = {
  isFirstVisit: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(FIRST_VISIT_KEY);
      // 값이 없으면 첫 방문으로 간주
      return value !== 'true';
    } catch (error) {
      console.error('AsyncStorage 읽기 오류:', error);
      // 오류 시 보수적으로 온보딩을 다시 보여준다
      return true;
    }
  },

  setFirstVisitCompleted: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(FIRST_VISIT_KEY, 'true');
    } catch (error) {
      console.error('AsyncStorage 쓰기 오류:', error);
      throw error;
    }
  },

  resetFirstVisit: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(FIRST_VISIT_KEY);
    } catch (error) {
      console.error('AsyncStorage 제거 오류:', error);
      throw error;
    }
  },
};


