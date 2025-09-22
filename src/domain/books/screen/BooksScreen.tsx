import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Background } from '@/shared/component/Background';
import { Text } from '@component/Text';
import { BookShelf } from '@/domain/books/component/BookShelf';
import { BookGrid } from '@/domain/books/component/BookGrid';
import { SegmentedControl, ViewType } from '@/domain/books/component/SegmentedControl';
import { useReadingLogs, useIsReadingLogsLoading } from '@/shared/store/readingLogsWithBooksStore';
import { Colors } from '@constant/Colors';
import { transformReadingLogToBookWithRecord } from '@/shared/utils/bookDataTransform';

export const BooksScreen = () => {
  const [selectedView, setSelectedView] = useState<ViewType>('shelf');
  const readingLogs = useReadingLogs();
  const isLoading = useIsReadingLogsLoading();

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
  };

  // readingLogs를 BookWithRecord 형태로 변환 (공통 함수 사용)
  const books = readingLogs.map(transformReadingLogToBookWithRecord);
  if (isLoading) {
    return (
      <Background isTabBarGap={true}>
        <View className="px-6 py-4">
          <Text text="Books" type="title1" className="text-white" />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text text="독서 기록을 불러오는 중..." className="text-gray-300 text-sm mt-2" />
        </View>
      </Background>
    );
  }

  if (readingLogs.length === 0) {
    return (
      <Background isTabBarGap={true}>
        <View className="px-6 py-4">
          <Text text="Books" type="title1" className="text-white" />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text text="아직 읽은 책이 없습니다" className="text-gray-300 text-sm" />
          <Text text="첫 번째 책을 읽어보세요!" className="text-gray-400 text-xs mt-1" />
        </View>
      </Background>
    );
  }

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
          <BookShelf books={books} />
        ) : (
          <BookGrid books={books} />
        )}
      </View>
    </Background>
  );
};