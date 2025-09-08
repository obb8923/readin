import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text } from '@components/Text';
import { CalendarBottomPanel } from './CalendarBottomPanel';
import { DiaryEntry } from '@/shared/types/diary';
import { StorageService } from '@/shared/services/storageService';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  selectedDiary?: DiaryEntry | null | undefined;
}

export const Calendar = ({ onDateSelect, selectedDate, selectedDiary }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [diaryDates, setDiaryDates] = useState<Set<string>>(new Set());
  
  // 화면 크기에 따른 동적 셀 크기 계산
  const screenWidth = Dimensions.get('window').width;
  const calendarPadding = 32; // p-4 * 2 = 16px * 2
  const availableWidth = screenWidth - calendarPadding;
  const cellWidth = availableWidth / 7;
  const cellHeight = Math.max(48, cellWidth * 0.8); // 최소 48px, 최대 셀 너비의 80%
  
  // 현재 월의 일기가 있는 날짜들을 불러오기
  useEffect(() => {
    const loadMonthlyDiaryDates = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // 0부터 시작하므로 +1
        const monthlyDiaries = await StorageService.getMonthlyDiaries(year, month);
        const dateSet = new Set(monthlyDiaries.map(diary => diary.date));
        setDiaryDates(dateSet);
      } catch (error) {
        console.error('월별 일기 날짜 로딩 오류:', error);
      }
    };

    loadMonthlyDiaryDates();
  }, [currentDate]); // currentDate가 변경될 때마다 실행
  
  // 월의 첫 번째 날을 가져오기
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };
  
  // 월의 마지막 날을 가져오기
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };
  
  // 월의 첫 번째 날이 무슨 요일인지 가져오기 (0: 일요일)
  const getFirstDayOfWeek = (date: Date) => {
    return getFirstDayOfMonth(date).getDay();
  };
  
  // 캘린더 주별 구조로 날짜 배열 생성
  const generateCalendarWeeks = () => {
    const firstDay = getFirstDayOfMonth(currentDate);
    const lastDay = getLastDayOfMonth(currentDate);
    const firstDayOfWeek = getFirstDayOfWeek(currentDate);
    const daysInMonth = lastDay.getDate();
    
    const weeks = [];
    let currentWeek = [];
    
    // 이전 달의 마지막 날들로 빈 공간 채우기
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      
      // 주말(토요일)이거나 마지막 날이면 주를 완성
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }
    
    // 마지막 주가 7일이 안 되면 다음 달 날짜로 채우기
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };
  
  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // 날짜 선택 핸들러
  const handleDateSelect = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };
  
  // 날짜가 선택된 날짜인지 확인
  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };
  
  // 특정 날짜에 일기가 있는지 확인
  const hasDiaryOnDate = (date: Date) => {
    // 로컬 시간대를 기준으로 YYYY-MM-DD 형식 생성
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return diaryDates.has(dateString);
  };

  // 오늘 날짜인지 확인
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };
  
  // 요일에 따른 텍스트 색상 결정
  const getDateTextColor = (date: Date, dayIndex: number) => {
    if (isSelectedDate(date)) {
      return 'text-white';
    }
    if (isToday(date)) {
      return 'text-blue-600 font-semibold';
    }
    if (dayIndex === 0) { // 일요일
      return 'text-red-500';
    }
    if (dayIndex === 6) { // 토요일
      return 'text-blue-500';
    }
    return 'text-gray-800';
  };
  
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  const weeks = generateCalendarWeeks();
  
  return (
    <View className="bg-background p-4 rounded-lg border-2 border-line">
      {/* 헤더 - 월/년 표시 및 네비게이션 */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity
          onPress={goToPreviousMonth}
          className="p-2"
        >
          <Text text="‹" type="semibold" className="text-xl text-gray-600" />
        </TouchableOpacity>
        
        <Text text={`${currentDate.getFullYear()}년 ${monthNames[currentDate.getMonth()]}`} type="semibold" className="text-lg text-text-black" />
        
        <TouchableOpacity
          onPress={goToNextMonth}
          className="p-2"
        >
          <Text text="›" type="semibold" className="text-xl text-gray-600" />
        </TouchableOpacity>
      </View>
      
      {/* 요일 헤더 */}
      <View className="flex-row mb-3">
        {dayNames.map((day, index) => (
          <View key={index} className="flex-1 items-center py-2">
            <Text text={day} type="semibold" className={`text-sm font-medium ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
            }`} />
          </View>
        ))}
      </View>
      
      {/* 캘린더 그리드 - 주별로 구성 */}
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} className="flex-row">
          {week.map((date, dayIndex) => (
            <View 
              key={dayIndex} 
              className="flex-1 justify-center items-center"
              style={{ height: cellHeight }}
            >
              {date ? (
                <TouchableOpacity
                  onPress={() => handleDateSelect(date)}
                  className={`justify-center items-center rounded-lg relative ${
                    isSelectedDate(date)
                      ? 'bg-blue-500'
                      : isToday(date)
                      ? 'bg-blue-100'
                      : 'bg-transparent'
                  }`}
                  style={{
                    width: Math.min(cellWidth * 0.8, 44), // 셀 너비의 80% 또는 최대 44px
                    height: Math.min(cellWidth * 0.8, 44),
                  }}
                >
                  {/* 일기가 있는 날에 circle.webp 이미지 표시 */}
                  {hasDiaryOnDate(date) && (
                    <Image
                      source={require('../../../../assets/webp/circle.webp')}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: Math.min(cellWidth * 0.8, 44),
                        height: Math.min(cellWidth * 0.8, 44),
                        zIndex: 0,
                        resizeMode: 'contain',
                      }}
                    />
                  )}
                  <Text 
                    text={date.getDate().toString()} 
                    type="semibold" 
                    className={getDateTextColor(date, dayIndex)}
                    style={{ zIndex: 10 }}
                  />
                </TouchableOpacity>
              ) : (
                <View style={{ 
                  width: Math.min(cellWidth * 0.8, 44), 
                  height: Math.min(cellWidth * 0.8, 44) 
                }} />
              )}
            </View>
          ))}
        </View>
      ))}
      
      {/* CalendarBottomPanel 추가 */}
      <CalendarBottomPanel
        selectedDate={selectedDate || null}
        selectedDiary={selectedDiary}
      />
    </View>
  );
};
