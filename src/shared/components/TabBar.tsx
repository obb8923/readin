import React, { useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useActiveTab, TabName, useSetActiveTab } from '@store/tabStore';
import { useDiary } from '@libs/hooks/useDiary';
import { Colors } from '@constants/Colors';

// SVG 아이콘 import
import PencilIcon from '@assets/svgs/Pencil.svg';
import CalendarIcon from '@assets/svgs/Calendar.svg';
import DotsIcon from '@assets/svgs/Dots.svg';

// 탭 정보 타입
interface TabInfo {
  name: TabName;
  icon: React.ComponentType<any>;
}

// 탭 정보 배열
const tabs: TabInfo[] = [
  { name: 'Diary', icon: PencilIcon },
  { name: 'Calendar', icon: CalendarIcon },
  { name: 'Etc', icon: DotsIcon },
];

export const TabBar = () => {
  const activeTab = useActiveTab();
  const setActiveTab = useSetActiveTab();
  const { error: diaryError } = useDiary();

  const handleTabPress = (tabName: TabName) => {
    setActiveTab(tabName);
  };
  
  // 에러가 있으면 Alert로 표시
  useEffect(() => {
    if (diaryError) {
      Alert.alert(
        '오류가 발생했어요', 
        diaryError,
        [
          { text: '확인', onPress: () => {} }
        ]
      );
    }
  }, [diaryError]);

  return (
    <LinearGradient
      colors={[
        'rgba(0, 0, 0, 0)',       // 완전 투명
        'rgba(0, 0, 0, 0.05)',     // 약간 투명
        'rgba(0, 0, 0, 0.15)',     // 중간 투명도
        'rgba(0, 0, 0, 0.25)'      // 진한 투명도
      ]}
      locations={[0, 0.2, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
        zIndex: 50,
      }}
    >
      <View className="h-10" />
      <View className="w-full flex-row justify-end items-center">
        <View className="w-5/12 flex-row px-3 py-2 items-center justify-evenly rounded-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            const Icon = tab.icon;
            
            return (
              <TouchableOpacity
                key={tab.name}
                className={`items-center justify-center w-12 h-12 rounded-full ${
                  isActive ? 'bg-background/80' : 'bg-transparent'
                }`}
                onPress={() => handleTabPress(tab.name)}
                activeOpacity={0.7}
              >
                <Icon 
                  width={22} 
                  height={22} 
                  color={isActive ? Colors.blue900 : Colors.background}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </LinearGradient>
  );
};
