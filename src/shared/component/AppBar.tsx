import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from '@component/Text';
import ChevronLeft from "@assets/svgs/ChevronLeft.svg";
import CrossMark from "@assets/svgs/CrossMark.svg";
import { Colors } from '@constant/Colors';
export type AppBarProps = {
  title?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  className?: string;
  style?: ViewStyle | ViewStyle[];
};

export const AppBar = ({
  title,
  onLeftPress,
  onRightPress,
  className = '',
  style,
}: AppBarProps) => {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3 bg-black border-b border-gray800 h-14 ${className}`}
      style={style}
    >
      {/* Left Section */}
      <View className="flex-1 flex-row items-center justify-start">
        {onLeftPress && (
          <TouchableOpacity
            onPress={onLeftPress}
            className="w-1/2 h-14 justify-center items-start pl-2"
            activeOpacity={0.7}
            disabled={!onLeftPress}
          >
            <ChevronLeft width={10} height={19} color={Colors.white} />
          </TouchableOpacity>
        )}
      
      </View>
      {/* Title Section */}
      <View className="flex-1 flex-row items-center justify-center">
      {title && (
          <Text
            text={title}
            type="body1"
            className="text-white flex-1 text-center"
            numberOfLines={1}
          />
        )}
      </View>

      {/* Right Section */}
      <View className="flex-1 flex-row items-center justify-end">
      {onRightPress && (
        <TouchableOpacity
          onPress={onRightPress}
          className="w-1/2 h-14 justify-center items-end pr-2"
          activeOpacity={0.7}
          disabled={!onRightPress}
        >
          <CrossMark width={14} height={14} color={Colors.white} />
        </TouchableOpacity>
      )}
      </View>
    </View>
  );
};
