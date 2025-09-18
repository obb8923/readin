import React from 'react';
import { View } from 'react-native';
import { Background } from '@/shared/component/Background';
import SearchIcon from "@assets/svgs/Search.svg"
import { Colors } from '@constant/Colors';
import { TowerOfBooks } from '../component/TowerOfBooks';
import { Text } from '@component/Text';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '@nav/stack/Home';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useShowTabBar } from '@/shared/store/tabStore';
import { useFocusEffect } from '@react-navigation/native';
export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const showTabBar = useShowTabBar();
  useFocusEffect(() => {
    showTabBar();
  });
  return (
    <Background isTabBarGap={true}>
      {/* 검색 페이지 이동 버튼 */}
      <View className="w-full px-4 mt-2">
        <View 
        className="flex-row items-center justify-start h-14 bg-background rounded-full px-4 py-3 border border-primary overflow-hidden"
        onTouchEnd={() => {
          navigation.navigate('BookSearch');
        }}
        >
          {/* 검색 아이콘 */}
          <View className="mr-2">
          <SearchIcon width={20} height={20} color={Colors.primary} />
          </View>
          <Text text="책을 검색해서 책장에 추가해보세요.." type="body2" className="text-gray200 flex-1" numberOfLines={1} />
        </View>
      </View>
      {/* 책장 */}
      <View 
      className="flex-1 px-4 my-4">
        {/* tower of books section */}
        <TowerOfBooks />
      </View>
    </Background>
  );
};