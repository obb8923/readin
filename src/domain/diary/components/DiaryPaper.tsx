import React, { useEffect, useState } from 'react'
import { View, TouchableOpacity, Modal, Platform, Image, ScrollView } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Text } from '@components/Text'
import { TextBox } from '@components/TextBox'
import { WeatherSelector } from './WeatherSelector'
import { KeyboardAccessoryBar } from './KeyboardAccessoryBar'
import { useDiary } from '../../../shared/libs/hooks/useDiary'
import { formatSelectedDate } from '../../../shared/libs/date'
import { useAnimationStore } from '@store/animationStore'
import { DIARY_ANIMATION_CONSTANTS } from '@constants/DiaryAnimation'
import { dateStyle, commentStyle, FLOWER_IMAGES, SMALL_IMAGE_SIZE, PADDING_TOP, HORIZONTAL_PADDING, NUMBER_OF_LINES, LINE_HEIGHT, TEXT_SIZE, MIN_TEXT_HEIGHT } from '@constants/normal'

export const DiaryPaper = () => {
  const { currentDate, isDiaryWrittenToday, changeDate, currentContent, currentComment, currentFlowerIndex } = useDiary()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const { year, month, day } = formatSelectedDate(currentDate)
  
  // 저장 시퀀스 관련 상태
  const { saveSequenceId, saveAnimationStep, runSave, setSaveAnimationStep } = useAnimationStore()
  
  // 날짜 선택 처리
  const handleDatePress = () => {
    setShowDatePicker(true)
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    
    if (selectedDate && event.type !== 'dismissed') {
      changeDate(selectedDate)
    }
    
    if (Platform.OS === 'ios' && event.type === 'dismissed') {
      setShowDatePicker(false)
    }
  }

  // 저장 함수 실행 감지 및 처리
  useEffect(() => {
    const executeSave = async () => {
      if (saveAnimationStep === 'saving' && runSave) {
        try {
          await runSave();
        } catch (error) {
          console.error('저장 실행 오류:', error);
          setSaveAnimationStep('idle');
        }
      }
    };
    
    executeSave();
  }, [saveSequenceId, saveAnimationStep, runSave, setSaveAnimationStep]);

  // 애니메이션 완료 후 대기 처리
  useEffect(() => {
    if (saveAnimationStep === 'waiting_for_result') {
      // 애니메이션이 완료된 후 최소 대기 시간 후 역방향 애니메이션 시작
      setTimeout(() => {
        setSaveAnimationStep('reversing');
      }, DIARY_ANIMATION_CONSTANTS.SAVE_ANIMATION.MIN_WAIT_TIME_MS);
    }
  }, [saveAnimationStep, setSaveAnimationStep]);
  return (
    <View className='flex-1 border border-line bg-background'>
      {/* 날짜, 날씨 영역 */}
      <View className="flex-row items-center justify-center border-b border-line p-3">
        <TouchableOpacity 
          onPress={handleDatePress}
          className="flex-row items-center"
          activeOpacity={0.7}
        >
          <Text text={`${year}`} type="kb2019" className={dateStyle}/>
          <Text text=' 년  ' type="black" className={dateStyle}/>
          <Text text={`${month}`} type="kb2019" className={dateStyle}/>
          <Text text=' 월  ' type="black" className={dateStyle}/>
          <Text text={`${day}`} type="kb2019" className={dateStyle}/>
          <Text text=' 일  ' type="black" className={dateStyle}/>
        </TouchableOpacity>
        <WeatherSelector textStyle={dateStyle} disabled={isDiaryWrittenToday} />
      </View>

      {/* 날짜 선택기 */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white items-center">
              <View className="w-full flex-row justify-between items-center p-4 border-b border-gray-200">
                <TouchableOpacity onPress={() => changeDate(new Date())}>
                  <Text text="오늘 날짜" type="regular" className="text-gray-700 text-lg" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text text="완료" type="regular" className="text-blue-600 text-lg font-semibold" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={currentDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={currentDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )
      )}
      {/* 일기장 내용 */}
      <View className="flex-1">
        {isDiaryWrittenToday ? (
          // 일기가 이미 존재하는 경우 - 스크롤 가능한 읽기 전용 뷰
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="relative" style={{ minHeight: MIN_TEXT_HEIGHT }}>
              {/* 라인 배경 */}
              <View className="absolute inset-0" style={{ paddingTop: PADDING_TOP, paddingLeft: 16, paddingRight: 16 }}>
                {Array.from({ length: NUMBER_OF_LINES }, (_, index) => (
                  <View
                    key={index}
                    className="border-b border-line"
                    style={{ height: LINE_HEIGHT, marginBottom: 0 }}
                  />
                ))}
              </View>

              {/* 내용 */}
              <View className="py-3 px-6">
                <Text
                  text={currentContent}
                  type="kb2019"
                  className="text-text-black"
                  style={{ 
                    fontSize: TEXT_SIZE,
                    lineHeight: LINE_HEIGHT, 
                    textAlignVertical: 'top', 
                  }}
                />
              </View>

              {/* 작은 이미지 - 글 바로 밑 오른쪽에 배치 */}
              {currentFlowerIndex && (
                <View
                  pointerEvents="none"
                  className="flex-row items-center justify-end w-full z-15"
                  style={{ paddingRight: HORIZONTAL_PADDING}}
                >
                  <Image
                    source={FLOWER_IMAGES[(Math.max(1, Math.min(currentFlowerIndex, FLOWER_IMAGES.length)) - 1)]}
                    resizeMode="contain"
                    style={{ width: SMALL_IMAGE_SIZE, height: SMALL_IMAGE_SIZE }}
                  />
                </View>
              )}

              {/* 코멘트 - 작은 이미지 바로 아래에 배치 */}
              {currentComment && (
                <View
                  pointerEvents="none"
                  className="z-20 px-6 pb-24"
                >
                  <Text
                    text={currentComment}
                    type="kb2023"
                    className={commentStyle}
                    style={{ transform: [{ rotate: '-1deg' }] }}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          // 일기가 없는 경우 - 기존처럼 TextBox로 작성
          <TextBox />
        )}
      </View>
      
      {/* 키보드 액세서리 바 */}
      <KeyboardAccessoryBar />
    </View>
  )
}


