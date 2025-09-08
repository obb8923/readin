import React from 'react';
import { View } from 'react-native';
import { DiaryPreview } from './DiaryPreview';
import { DiaryEntry } from '@/shared/types/diary';
import { Text } from '@components/Text';

interface CalendarBottomPanelProps {
  selectedDate: Date | null;
  selectedDiary: DiaryEntry | null | undefined;
}

export const CalendarBottomPanel = ({ 
  selectedDate, 
  selectedDiary 
}: CalendarBottomPanelProps) => {
  const formatSelectedDateLabel = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  };

  if (!selectedDate) {
    return null;
  }

  return (
    <View className="mt-4 border-t border-line border-dashed pt-8">
      {selectedDiary ? (
        <DiaryPreview date={selectedDate} entry={selectedDiary} />
      ) : (
        <View className="px-4 pb-4 rounded-lg">
          <Text text={formatSelectedDateLabel(selectedDate)} type="semibold" className="text-lg font-p-semibold text-blue-800 mb-2" />
          <Text text="작성된 일기가 없습니다." type="semibold" className="text-md text-blue-600 font-p-semibold" />
        </View>
      )}
    </View>
  );
};
