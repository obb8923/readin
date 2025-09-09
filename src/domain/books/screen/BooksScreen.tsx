import React, { useState } from "react";
import { View } from "react-native";
import { Background } from '@/shared/component/Background';
import { Text } from '@/shared/component/Text';
import { BookShelf } from '@/domain/books/component/BookShelf';
import { BookGrid } from '@/domain/books/component/BookGrid';
import { SegmentedControl, ViewType } from '@/domain/books/component/SegmentedControl';
import { defaultBooks } from '@/shared/constant/mock';

export const BooksScreen = () => {
  const [selectedView, setSelectedView] = useState<ViewType>('shelf');

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
  };

  return (
    <Background isTabBarGap={true}>
      {/* 헤더 */}
      <View className="px-6 py-4">
        <Text text="Books" type="title1" className="text-white" />
      </View>
      
      {/* 뷰 선택 컨트롤 */}
      <SegmentedControl 
        selectedView={selectedView} 
        onViewChange={handleViewChange} 
      />
      
      {/* 책장/그리드 컴포넌트 */}
      <View className="flex-1">
        {selectedView === 'shelf' ? (
          <BookShelf books={defaultBooks} />
        ) : (
          <BookGrid books={defaultBooks} />
        )}
      </View>
    </Background>
  );
};