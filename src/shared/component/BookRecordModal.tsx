import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, Image, ActivityIndicator, Alert, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';
import { Text } from '@component/Text';
import { BookType, BookWithRecord } from '@/shared/type/bookType';
import { Colors } from '@constant/Colors';
import RNHorizontalSlider from '@/shared/component/Slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/shared/libs/supabase/supabase';

interface BookRecordModalProps {
  visible: boolean;
  onClose: () => void;
  book: BookType | BookWithRecord | null;
  onUpdate?: () => void;
}

export const BookRecordModal = ({ visible, onClose, book, onUpdate }: BookRecordModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [rating, setRating] = useState(100);
  const [memo, setMemo] = useState('');
  const [memoDraft, setMemoDraft] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showMemoEditor, setShowMemoEditor] = useState(false);
  const [ratingWidth, setRatingWidth] = useState(0);
  const MEMO_MAX = 200;

  // 책 기록 정보 초기화
  useEffect(() => {
    if (visible && book) {
      // BookWithRecord인 경우 기록 정보 사용
      if ('record' in book) {
        setRating(book.record.rate);
        setMemo(book.record.memo);
        setStartDate(book.record.startedAt ? new Date(book.record.startedAt) : null);
        setEndDate(book.record.finishedAt ? new Date(book.record.finishedAt) : null);
      } else {
        // BookType인 경우 기본값 설정
        setRating(100);
        setMemo('');
        setStartDate(new Date());
        setEndDate(new Date());
      }
    }
  }, [visible, book]);

  const handleCloseModal = () => {
    setRating(100);
    setMemo('');
    setMemoDraft('');
    setStartDate(null);
    setEndDate(null);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowMemoEditor(false);
    onClose();
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleRatingLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setRatingWidth(width - 32); // 좌우 패딩 제외
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '선택 안함';
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleSave = async () => {
    if (!book || isSaving) return;

    try {
      setIsSaving(true);
      const { data: userInfo } = await supabase.auth.getUser();
      if (!userInfo?.user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const toISO = (d?: Date | null) => (d ? d.toISOString().split('T')[0] : null);
      const hasRecord = 'record' in book;

      if (hasRecord) {
        // 기존 기록 업데이트
        const { error } = await supabase
          .from('reading_logs')
          .update({
            rate: rating,
            memo,
            started_at: toISO(startDate),
            finished_at: toISO(endDate),
            updated_at: new Date().toISOString(),
          })
          .eq('book_id', book.id)
          .eq('user_id', userInfo.user.id);

        if (error) throw error;
        Alert.alert('저장 완료', '기록이 업데이트되었습니다.');
      } else {
        // 새 기록 생성
        const { error } = await supabase
          .from('reading_logs')
          .insert({
            user_id: userInfo.user.id,
            book_id: book.id,
            rate: rating,
            memo,
            started_at: toISO(startDate),
            finished_at: toISO(endDate),
          });

        if (error) throw error;
        Alert.alert('저장 완료', '기록이 저장되었습니다.');
      }

      onUpdate?.();
      handleCloseModal();
    } catch (error: any) {
      console.error('저장 오류:', error);
      Alert.alert('저장 실패', error?.message || '잠시 후 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!book) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleCloseModal}
    >
      <View className="flex-1 justify-center items-center bg-black/80">
        <View className="bg-gray800 rounded-2xl p-6 mx-4 w-11/12 border border-primary">
          <View>
              {/* 책 정보 섹션 */}
              <View className="flex-row mb-6">
                <View className="mr-4">
                  <View 
                    className="bg-gray-200 rounded-md items-center justify-center"
                    style={{ width: 80, height: 100 }}
                  >
                    {book.imageUrl && (
                      <Image 
                        source={{ uri: book.imageUrl }} 
                        className="w-full h-full rounded-md"
                        resizeMode="cover"
                      />
                    )}
                  </View>
                </View>
                
                <View className="flex-1">
                  <Text 
                    text={book.title} 
                    type="body1" 
                    className="text-white mb-2" 
                    numberOfLines={2}
                  />
                  <Text 
                    text={book.author.join(', ')} 
                    type="body3" 
                    className="text-gray300 mb-1" 
                    numberOfLines={1}
                  />
                  <Text 
                    text={book.publisher} 
                    type="caption1" 
                    className="text-gray400" 
                    numberOfLines={1}
                  />
                </View>
              </View>

              {/* Rating 섹션 */}
              <View 
                className="mb-6 w-full"
                onLayout={handleRatingLayout}
              >
                <Text text="평점" type="body2" className="text-white mb-3" />
                <View className="flex-row items-center relative justify-center items-center">
                  <RNHorizontalSlider
                    min={0}
                    max={100}
                    step={1}
                    width={ratingWidth}
                    height={36}
                    value={rating}
                    onChange={setRating}
                    minimumTrackTintColor={Colors.primary}
                    maximumTrackTintColor={Colors.gray200}
                  />
                  <View pointerEvents="none" className="absolute left-4 justify-center items-center">
                    <Text text={`${rating}점`} type="body3" className="text-gray900 font-bold" />
                  </View>
                </View>
              </View>

              {/* 날짜 섹션 */}
              <View className="w-full mb-6">
                <Text text="독서 기간" type="body2" className="text-white mb-3" />
                <View className="w-full flex-row items-center justify-around">
                  <TouchableOpacity 
                    onPress={() => setShowStartDatePicker(true)}
                    className="bg-gray700 rounded-lg p-3 flex-1"
                    activeOpacity={0.8}
                  >
                    <Text 
                      text={formatDate(startDate)} 
                      type="body3" 
                      className={startDate ? "text-white" : "text-gray400"} 
                    />
                  </TouchableOpacity>

                  <Text text="부터" type="body3" className="text-gray300 px-2" />
                  
                  <TouchableOpacity 
                    onPress={() => setShowEndDatePicker(true)}
                    className="bg-gray700 rounded-lg p-3 flex-1"
                    activeOpacity={0.8}
                  >
                    <Text 
                      text={formatDate(endDate)} 
                      type="body3" 
                      className={endDate ? "text-white" : "text-gray400"} 
                    />
                  </TouchableOpacity>
                  <Text text="까지" type="body3" className="text-gray300 px-2" />
                </View>
              </View>

              {/* 메모 섹션 */}
              <View className="mb-6">
                <Text text="메모" type="body2" className="text-white mb-3" />
                <TouchableOpacity
                  onPress={() => {
                    setMemoDraft(memo);
                    setShowMemoEditor(true);
                  }}
                  activeOpacity={0.8}
                  className="bg-gray700 rounded-lg p-3"
                >
                  {memo ? (
                    <Text
                      text={memo}
                      type="body3"
                      className="text-white"
                      numberOfLines={3}
                    />
                  ) : (
                    <Text
                      text="짧은 감상평을 남겨보세요 (선택)"
                      type="body3"
                      className="text-gray400"
                      numberOfLines={1}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* 버튼 섹션 */}
              <View className="flex-row">
                <TouchableOpacity onPress={handleCloseModal} className="flex-1 mr-2 bg-gray700 rounded-xl py-3 items-center" activeOpacity={0.8}>
                  <Text text="닫기" type="body2" className="text-white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} className="flex-1 ml-2 bg-primary rounded-xl py-3 items-center" activeOpacity={0.8}>
                  {isSaving ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color={Colors.white || '#fff'} />
                      <Text text="  저장 중..." type="body2" className="text-white" />
                    </View>
                  ) : (
                    <Text text={('record' in book) ? "업데이트" : "저장"} type="body2" className="text-white" />
                  )}
                </TouchableOpacity>
              </View>
          </View>
        </View>
      </View>

      {/* 날짜 선택기 모달들 */}
      <Modal
        visible={showStartDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStartDatePicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray800 rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text text="읽기 시작한 날" type="title3" className="text-white" />
              <TouchableOpacity 
                onPress={() => setShowStartDatePicker(false)}
                className="bg-gray700 rounded-full p-2"
                activeOpacity={0.8}
              >
                <Text text="완료" type="body2" className="text-white" />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
              style={{ backgroundColor: 'transparent' }}
              textColor="white"
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEndDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEndDatePicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray800 rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text text="다 읽은 날" type="title3" className="text-white" />
              <TouchableOpacity 
                onPress={() => setShowEndDatePicker(false)}
                className="bg-gray700 rounded-full p-2"
                activeOpacity={0.8}
              >
                <Text text="완료" type="body2" className="text-white" />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndDateChange}
              style={{ backgroundColor: 'transparent' }}
              textColor="white"
            />
          </View>
        </View>
      </Modal>

      {/* 메모 에디터 모달 */}
      <Modal
        visible={showMemoEditor}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMemoEditor(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="bg-gray800 rounded-t-3xl p-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text text="메모" type="title3" className="text-white" />
                  <TouchableOpacity
                    onPress={() => {
                      setMemo(memoDraft);
                      setShowMemoEditor(false);
                    }}
                    className="bg-gray700 rounded-full p-2"
                    activeOpacity={0.8}
                  >
                    <Text text="완료" type="body2" className="text-white" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  value={memoDraft}
                  onChangeText={setMemoDraft}
                  placeholder="짧은 감상평을 남겨보세요 (선택)"
                  placeholderTextColor={Colors.gray400}
                  multiline
                  numberOfLines={8}
                  className="bg-gray700 rounded-lg p-3 text-white text-sm"
                  style={{ textAlignVertical: 'top', minHeight: 160 }}
                  maxLength={MEMO_MAX}
                  autoFocus
                />
                <View className="mt-2 w-full items-end">
                  <Text text={`${memoDraft.length}/${MEMO_MAX}`} type="caption1" className="text-gray400" />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </Modal>
  );
};
