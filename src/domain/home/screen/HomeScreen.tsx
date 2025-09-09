import React from 'react';
import { View } from 'react-native';
import { Background } from '@/shared/component/Background';
import { SearchBar } from '@/shared/component/SearchBar';
import { TowerOfBooks } from '../component/TowerOfBooks';
export const HomeScreen = () => {
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