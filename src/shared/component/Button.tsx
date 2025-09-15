import React from 'react';
import { ActivityIndicator, TouchableOpacity, ViewStyle } from 'react-native';
import { Text, TypographyType } from './Text';
import { Colors } from '../constant/Colors';

export type ButtonProps = {
  text: string;
  onPress: () => void;
  textType?: TypographyType;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
  style?: ViewStyle | ViewStyle[];
  isLoading?: boolean;
};

export const Button = ({
  text,
  onPress,
  textType = 'title4',
  disabled = false,
  className = '',
  textClassName = '',
  style,
  isLoading = false,
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      className={`flex-1 w-auto rounded-xl px-4 py-2 justify-center items-center
        ${className}`}
      style={style}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.white} />
      ) : (
        <Text 
          text={text} 
          type={textType} 
          className={`text-center text-white ${textClassName}`}
        />
      )}
    </TouchableOpacity>
  );
};


