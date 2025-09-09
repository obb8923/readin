import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from "@/shared/component/Text";
import RightArrowIcon from '@assets/svgs/ChevronRight.svg';
import { Colors } from '@/shared/constant/Colors';
interface MenuItemProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

export const MenuItem = ({ title, subtitle, onPress, showArrow = true }: MenuItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between py-4 px-6 border-b border-gray-800"
    activeOpacity={0.7}
  >
    <View className="flex-1">
      <Text text={title} type="body2" className="text-white" />
      {subtitle && (
        <Text text={subtitle} type="caption1" className="text-gray-400 mt-1" />
      )}
    </View>
    {showArrow && (
      <RightArrowIcon width={9} height={16} color={Colors.gray500} />
    )}
  </TouchableOpacity>
);
