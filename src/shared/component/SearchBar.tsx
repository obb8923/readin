import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from './Text';
import SearchIcon from '@assets/svgs/Search.svg';
import { Colors } from '../constant/Colors';
export type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: (text: string) => void;
  onClear?: () => void;
  className?: string;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  autoFocus?: boolean;
};

export const SearchBar = ({
  placeholder = '검색어를 입력하세요',
  value,
  onChangeText,
  onSubmitEditing,
  onClear,
  className = '',
  style,
  disabled = false,
  autoFocus = false,
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = useState('');
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleChangeText = (text: string) => {
    if (value === undefined) {
      setInternalValue(text);
    }
    onChangeText?.(text);
  };

  const handleSubmitEditing = () => {
    onSubmitEditing?.(currentValue);
  };

  const handleClear = () => {
    if (value === undefined) {
      setInternalValue('');
    }
    onClear?.();
    onChangeText?.('');
  };

  return (
    <View 
      className={`h-14 flex-row items-center bg-background rounded-full px-4 py-3 border border-primary ${className}`}
      style={style}
    >
      {/* 검색 아이콘 */}
      <View className="mr-2">
      <SearchIcon width={20} height={20} color={Colors.primary} />
      </View>
      {/* 검색 입력 필드 */}
      <TextInput
        value={currentValue}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        editable={!disabled}
        autoFocus={autoFocus}
        className="flex-1 text-white"
        style={{
          height: 20,
          fontFamily: 'Pretendard-Regular',
          fontSize: 16,
          lineHeight: 16 * 1.4,
          letterSpacing: -0.4,
        }}
        returnKeyType="search"
      />
      
      {/* 클리어 버튼 */}
      {currentValue.length > 0 && (
        <TouchableOpacity 
          onPress={handleClear}
          className="ml-3 p-1"
          activeOpacity={0.7}
        >
          <Text text="✕" type="body2" className="text-gray-500" />
        </TouchableOpacity>
      )}
    </View>
  );
};
