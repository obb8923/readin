import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/shared/component/Text';
import { BookHorizontal } from '@/shared/component/BookHorizontal';
import { DEVICE_WIDTH } from '@/shared/constant/normal';
import { Colors } from '@constant/Colors';
import { useReadingLogs, useIsReadingLogsLoading } from '@/shared/store/readingLogsWithBooksStore';
import { getReadingLevel } from '@/shared/constant/ReadingLevels';
import { transformReadingLogToBookInfo } from '@/shared/utils/bookDataTransform';
import ArrowUpIcon from '@assets/svgs/ArrowUp.svg';
export const TowerOfBooks = () => {
  const readingLogs = useReadingLogs();
  const isLoading = useIsReadingLogsLoading();

  // 독서 기록이 없을 때 빈 배열 반환
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text text="독서 기록을 불러오는 중..." className="text-gray-300 text-sm mt-2" />
      </View>
    );
  }

  if (readingLogs.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
      <View className="flex-row items-center justify-center mb-16">
        <ArrowUpIcon width={40} height={45} color={Colors.gray500} />
      </View>
        <Text text="아직 읽은 책이 없습니다" className="text-gray-300 text-sm" />
        <Text text="첫 번째 책을 읽어보세요!" className="text-gray-400 text-xs mt-1" />
      </View>
    );
  }

  // 독서 기록에서 책 정보 추출 (공통 함수 사용)
  const books = readingLogs.map(transformReadingLogToBookInfo);

  // 총 페이지수 계산
  const totalPages = books.reduce((sum, book) => sum + book.pages, 0);
  
  // 총 두께 계산 (실제 책 두께의 합)
  const totalThickness = books.reduce((sum, book) => sum + book.thickness, 0);
  
  // 가장 높은 책의 높이 찾기
  const maxHeight = Math.max(...books.map(book => book.height));
  
  // 가장 높은 책을 DEVICE_WIDTH * 7/12로 설정하는 비례 상수 계산
  const scaleFactor = (DEVICE_WIDTH * 9 / 12) / maxHeight;
  
  // 두께를 적절한 단위로 포맷팅하는 함수
  const formatThickness = (thicknessInMm: number): string => {
    if (thicknessInMm >= 1000) {
      const meters = thicknessInMm / 1000;
      return `${Math.round(meters)}m`;
    } else if (thicknessInMm >= 500) {
      const centimeters = thicknessInMm / 10;
      return `${Math.round(centimeters)}cm`;
    } else {
      return `${Math.round(thicknessInMm)}mm`;
    }
  };
  
  // 총 높이에 따른 독서 레벨 계산
  const readingLevel = getReadingLevel(totalThickness);
  
  return (
    <View className="flex-1">
      
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 16,
          minHeight: '100%',
          borderBottomWidth: 1,
          borderBottomColor: Colors.primary,
        }}
      >
          {/* 총 높이 정보 표시 */}
      <View className="mb-4 p-3 rounded-lg">
        <Text 
          text={`${books.length}권의 책 \n ${totalPages} 페이지 \n 높이 ${formatThickness(totalThickness)}`}
          className="text-gray-300 text-xs mt-1 text-center"
        />
        <View className="flex-row">
        <Text text={readingLevel.title} type="body1" className="text-primary text-xs mt-1 text-center" />
        <Text text=" 급 독서광" type="body1" className="text-gray-300 text-xs mt-1 text-center" />

        </View>
      </View>
          {books.map((book, index) => (
              <BookHorizontal
                id={book.id}
                title={book.title}
                pages={book.pages}
                thickness={book.thickness}
                height={book.height}
                scale={scaleFactor}
                key={`${book.id}-${index}`}
                index={index}
              />
          ))}
      </ScrollView>
    </View>
  );
};
