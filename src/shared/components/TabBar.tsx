import React, { useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useActiveTab, TabName, useSetActiveTab } from '@store/tabStore';
import { Colors } from '@constants/Colors';

// SVG 아이콘 import
import HomeIcon from '@assets/svgs/Home.svg';
import CalendarIcon from '@assets/svgs/Calendar.svg';
import DotsIcon from '@assets/svgs/Dots.svg';
import { TAB_NAME } from '@constants/tab';
// 탭 정보 타입
interface TabInfo {
  name: TabName;
  icon: React.ComponentType<any>;
}

// 탭 정보 배열
const tabs: TabInfo[] = [
  { name: TAB_NAME.HOME, icon: HomeIcon },
  { name: TAB_NAME.BOOKS, icon: CalendarIcon },
  { name: TAB_NAME.PROFILE, icon: DotsIcon },
];

export const TabBar = () => {
  const activeTab = useActiveTab();
  const setActiveTab = useSetActiveTab();

  const handleTabPress = (tabName: TabName) => {
    setActiveTab(tabName);
  };
  


  return (
   <View
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
    </View>
  );
};
