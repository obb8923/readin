import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import BookShelf from '@assets/svgs/BookShelf.svg';
import Grid from '@assets/svgs/Grid.svg';
import { Colors } from '@constant/Colors';
export type ViewType = 'shelf' | 'grid';

interface SegmentedControlProps {
  selectedView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const SegmentedControl = ({ selectedView, onViewChange }: SegmentedControlProps) => {
  return (
    <View className="flex-row bg-gray800 rounded-lg p-1 mx-6 mb-4">
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
          color={selectedView === 'shelf' ? Colors.white : Colors.gray400}
          fill={selectedView === 'shelf' ? Colors.primary : 'transparent'}
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
          color={selectedView === 'grid' ? Colors.white : Colors.gray400} 
          fill={selectedView === 'grid' ? Colors.primary : 'transparent'}
        />
      </TouchableOpacity>
    </View>
  );
};