import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from './Text';

export type ButtonProps = {
  text: string;
  onPress: () => void;
  textType?: 'regular' | 'semibold' | 'extrabold' | 'black';
  disabled?: boolean;
  className?: string;
  textClassName?: string;
  style?: ViewStyle | ViewStyle[];
};

export const Button = ({
  text,
  onPress,
  textType = 'semibold',
  disabled = false,
  className = '',
  textClassName = '',
  style,
}: ButtonProps) => {
  
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      className={`w-auto rounded-full px-4 py-2 justify-center items-center ${disabled ? 'bg-disabled' : 'bg-blue-200'} ${className}`}
      style={style}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Text 
        text={text} 
        type={textType} 
        className={`text-center font-bold ${textClassName}`}
      />
    </TouchableOpacity>
  );
};
