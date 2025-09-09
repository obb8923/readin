import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import BookShelf from '@assets/svgs/BookShelf.svg';
import Grid from '@assets/svgs/Grid.svg';

export type ViewType = 'shelf' | 'grid';

interface SegmentedControlProps {
  selectedView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const SegmentedControl = ({ selectedView, onViewChange }: SegmentedControlProps) => {
  return (
    <View className="flex-row bg-gray-800 rounded-lg p-1 mx-6 mb-4">
      {/* 책장형 보기 버튼 */}
      <TouchableOpacity
        onPress={() => onViewChange('shelf')}
        className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-md ${
          selectedView === 'shelf' ? 'bg-primary' : 'bg-transparent'
        }`}
      >
        <BookShelf 
          width={18} 
          height={18} 
          fill={selectedView === 'shelf' ? '#fafafa' : '#999999'} 
        />
      </TouchableOpacity>

      {/* 그리드형 보기 버튼 */}
      <TouchableOpacity
        onPress={() => onViewChange('grid')}
        className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-md ${
          selectedView === 'grid' ? 'bg-primary' : 'bg-transparent'
        }`}
      >
        <Grid 
          width={18} 
          height={18} 
          fill={selectedView === 'grid' ? '#fafafa' : '#999999'} 
        />
      </TouchableOpacity>
    </View>
  );
};