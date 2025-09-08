import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Background } from '@components/Background';
import { Calendar } from '../components/Calendar';
import { StorageService } from '@services/storageService';
import { DiaryEntry } from '@/shared/types/diary';
import { formatDate } from '@libs/date';
import {TabBar} from '@/shared/components/TabBar';

export const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null | undefined>(undefined);

  useEffect(() => {
    const loadDiary = async () => {
      if (!selectedDate) {
        setSelectedDiary(undefined);
        return;
      }
      const key = formatDate(selectedDate);
      const entry = await StorageService.getDiary(key);
      setSelectedDiary(entry);
    };
    loadDiary();
  }, [selectedDate]);

  return (
    <Background isStatusBarGap={true} isTabBarGap={true} isImage={2}>
      <TabBar />

      <ScrollView 
      className="flex-1 px-4 py-6"
      contentContainerStyle={{ paddingBottom: 84 }}
      >
        {/* 캘린더 컴포넌트 (CalendarBottomPanel 포함) */}
        <Calendar
          onDateSelect={(date) => setSelectedDate(date)}
          selectedDate={selectedDate}
          selectedDiary={selectedDiary}
        />
      </ScrollView>
    </Background>
  );
};