import React from 'react';
import { View } from 'react-native';
import { Background } from '@/shared/component/Background';
import { Text } from '@/shared/component/Text';
import { SearchBar } from '@/shared/component/SearchBar';
import { TowerOfBooks } from '../component/TowerOfBooks';
import { TAB_BAR_HEIGHT } from '@/shared/constant/tab';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <Background isTabBarGap={true}>
      {/* 검색 바 */}
      <View className="w-full px-4 mt-2">
        <SearchBar placeholder="검색어를 입력하세요" />
      </View>
      <View 
      className="flex-1 px-4 mt-2">
        {/* tower of books section */}
        <TowerOfBooks />
      </View>
      
    </Background>
  );
};