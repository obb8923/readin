import React, { useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useActiveTab, TabName, useSetActiveTab } from '@store/tabStore';
import { Colors } from '@constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// SVG 아이콘 import
import HomeIcon from '@assets/svgs/Home.svg';
import BooksIcon from '@assets/svgs/Books.svg';
import ProfileIcon from '@assets/svgs/Profile.svg';
import { TAB_NAME, TAB_NAME_KOR } from '@constants/tab';
import { Text } from './Text';
// 탭 정보 타입
interface TabInfo {
  name: TabName;
  icon: React.ComponentType<any>;
  label: string;
}

// 탭 정보 배열
const tabs: TabInfo[] = [
  { name: TAB_NAME.HOME, icon: HomeIcon, label: TAB_NAME_KOR.HOME },
  { name: TAB_NAME.BOOKS, icon: BooksIcon, label: TAB_NAME_KOR.BOOKS },
  { name: TAB_NAME.PROFILE, icon: ProfileIcon, label: TAB_NAME_KOR.PROFILE },
];

export const TabBar = () => {
  const activeTab = useActiveTab();
  const setActiveTab = useSetActiveTab();

  const handleTabPress = (tabName: TabName) => {
    setActiveTab(tabName);
  };
  

  const insets = useSafeAreaInsets();
  return (
   <View  className="bg-gray800 absolute bottom-0 left-0 right-0 w-full z-50"
   style={{
    paddingBottom: insets.bottom,
   }}
   >
        <View className="flex-1 flex-row items-center justify-evenly py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            const Icon = tab.icon;
            
            return (
              <TouchableOpacity
                key={tab.name}
                className="flex-1 items-center justify-center py-1"
                onPress={() => handleTabPress(tab.name)}
                activeOpacity={0.7}
              >
                <Icon 
                  width={tab.name===TAB_NAME.HOME ? 20 : 22} 
                  height={tab.name===TAB_NAME.HOME ? 20 : 22} 
                  color={isActive ? Colors.white : Colors.gray600}
                />
                <Text 
                  text={tab.label}
                  type="caption1"
                  className="mt-1"
                  style={{
                    color: isActive ? Colors.white : Colors.gray600
                  }}
                />
              </TouchableOpacity>
            );
          })}
        </View>
    </View>
  );
};
