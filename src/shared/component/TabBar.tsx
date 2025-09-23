import React from 'react';
import { View, TouchableOpacity} from 'react-native';
import { useActiveTab, TabName, useSetActiveTab } from '@store/tabStore';
import { Colors } from '@constant/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeIcon from '@assets/svgs/Home.svg';
import BooksIcon from '@assets/svgs/Books.svg';
import ProfileIcon from '@assets/svgs/Profile.svg';
import { TAB_NAME, TAB_NAME_KOR ,TAB_BAR_HEIGHT} from '@constant/tab';
import { Text } from './Text';

// 탭 버튼 컴포넌트
interface TabButtonProps {
  tabName: TabName;
  isActive: boolean;
  onPress: () => void;
  icon: React.ComponentType<any>;
  label: string;
  iconSize: number;
}

const TabButton = ({ 
  tabName, 
  isActive, 
  onPress, 
  icon: Icon, 
  label, 
  iconSize 
}: TabButtonProps) => {
  return (
    <TouchableOpacity
      className="flex-1 items-center justify-center py-1"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon 
        width={iconSize} 
        height={iconSize} 
        color={isActive ? Colors.white : Colors.gray600}
      />
      <Text 
        text={label}
        type="caption1"
        className="mt-1"
        style={{
          color: isActive ? Colors.white : Colors.gray600
        }}
      />
    </TouchableOpacity>
  );
};

export const TabBar = () => {
  const activeTab = useActiveTab();
  const setActiveTab = useSetActiveTab();
  const handleTabPress = (tabName: TabName) => {
    setActiveTab(tabName);
  };
  const insets = useSafeAreaInsets();
  return (
   <View  className="bg-gray800 absolute bottom-0 left-0 right-0 w-full z-50 flex-row " 
   style={{
    paddingBottom: insets.bottom,
    height: TAB_BAR_HEIGHT + insets.bottom,
   }}
   >
 
          <TabButton
            tabName={TAB_NAME.HOME}
            isActive={activeTab === TAB_NAME.HOME}
            onPress={() => handleTabPress(TAB_NAME.HOME)}
            icon={HomeIcon}
            label={TAB_NAME_KOR.HOME}
            iconSize={20}
          />

          <TabButton
            tabName={TAB_NAME.BOOKS}
            isActive={activeTab === TAB_NAME.BOOKS}
            onPress={() => handleTabPress(TAB_NAME.BOOKS)}
            icon={BooksIcon}
            label={TAB_NAME_KOR.BOOKS}
            iconSize={22}
          />
          <TabButton
            tabName={TAB_NAME.PROFILE}
            isActive={activeTab === TAB_NAME.PROFILE}
            onPress={() => handleTabPress(TAB_NAME.PROFILE)}
            icon={ProfileIcon}
            label={TAB_NAME_KOR.PROFILE}
            iconSize={22}
          />
    </View>
  );
};
