import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  Platform, 
  LayoutChangeEvent, 
  KeyboardAvoidingView, 
  TouchableWithoutFeedback, 
  Keyboard,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from '@component/Text';
import { BookType, BookWithRecord } from '@/shared/type/bookType';
import { Colors } from '@constant/Colors';
import { BookImage } from '@/shared/component/BookImage';
import RNHorizontalSlider from '@/shared/component/Slider';
import { updateLogById, deleteLogById } from '@/shared/libs/supabase/reading_logs';
import { supabase } from '@/shared/libs/supabase/supabase';
import { saveBookAndLog } from '@/shared/libs/supabase/saveBookAndReadingLog';
import { updateBookById } from '@/shared/libs/supabase/books';
import { Button } from '@/shared/component/Button';
import { fetchPhysicalInfoWithPerplexity } from '@/shared/libs/supabase/enrichBook';
import { useReadingLogsWithBooksStore } from '@/shared/store/readingLogsWithBooksStore';
export type BookRecordModalMode = 'save' | 'view';

interface BookRecordModalProps {
  visible: boolean;
  onClose: () => void;
  book: BookType | BookWithRecord | null;
  mode: BookRecordModalMode;
  onSaveSuccess?: (newLog: any) => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

const MEMO_MAX = 200;

export const BookRecordModal = ({
  visible,
  onClose,
  book,
  mode,
  onSaveSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: BookRecordModalProps) => {
  const [rating, setRating] = useState(100);
  const [memo, setMemo] = useState('');
  const [memoDraft, setMemoDraft] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showMemoEditor, setShowMemoEditor] = useState(false);
  const [ratingWidth, setRatingWidth] = useState(0);
  const [isEnrichLoading, setIsEnrichLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [enriched, setEnriched] = useState<{ width: number; height: number; thickness: number; pages: number; weight: number; kdc?: string } | null>(null);
  const enrichPromiseRef = useRef<Promise<any> | null>(null);

  // 물리정보 편집 상태 (view 모드에서 인라인 편집)
  const [widthVal, setWidthVal] = useState<number | null>(null);
  const [heightVal, setHeightVal] = useState<number | null>(null);
  const [thicknessVal, setThicknessVal] = useState<number | null>(null);
  const [weightVal, setWeightVal] = useState<number | null>(null);
  const [pagesVal, setPagesVal] = useState<number | null>(null);

  const [editingField, setEditingField] = useState<null | 'width' | 'height' | 'thickness' | 'weight' | 'pages'>(null);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (visible && book) {
      if (mode === 'view' && 'record' in book && book.record) {
        // 조회 모드: 기존 기록 데이터로 초기화
        setRating(book.record.rate || 100);
        setMemo(book.record.memo || '');
        setStartDate(book.record.startedAt ? new Date(book.record.startedAt) : new Date());
        setEndDate(book.record.finishedAt ? new Date(book.record.finishedAt) : new Date());
        // 물리정보 상태 초기화
        setWidthVal(book.width ?? null);
        setHeightVal(book.height ?? null);
        setThicknessVal(book.thickness ?? null);
        setWeightVal(book.weight ?? null);
        setPagesVal(book.pages ?? null);
      } else {
        // 저장 모드: 기본값으로 초기화
        setRating(100);
        setMemo('');
        setStartDate(new Date());
        setEndDate(new Date());
        setWidthVal(null);
        setHeightVal(null);
        setThicknessVal(null);
        setWeightVal(null);
        setPagesVal(null);
      }
      setMemoDraft('');
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
      setShowMemoEditor(false);
      setEnriched(null);
      setEditingField(null);
      
      // 저장 모드일 때만 물리 정보 조회
      if (mode === 'save') {
        setIsEnrichLoading(true);
        const p = fetchPhysicalInfoWithPerplexity({
          title: book.title,
          authors: book.author,
          publisher: book.publisher,
          isbn: book.isbn,
        })
          .then((info) => setEnriched(info))
          .catch((e) => {
            console.warn('물리 정보 조회 실패:', e);
          })
          .finally(() => setIsEnrichLoading(false));
        enrichPromiseRef.current = p;
      }
    }
  }, [visible, book, mode]);

  const handleCloseModal = () => {
    onClose();
    setRating(100);
    setMemo('');
    setMemoDraft('');
    setStartDate(new Date());
    setEndDate(new Date());
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowMemoEditor(false);
    setEnriched(null);
  };

  // 날짜 선택 핸들러
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
      // 종료 날짜가 시작 날짜보다 이전이면 종료 날짜를 시작 날짜로 보정
      if (endDate && selectedDate && endDate < selectedDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      // 선택된 종료 날짜가 시작 날짜보다 이전이면 시작 날짜로 보정
      if (startDate && selectedDate < startDate) {
        setEndDate(startDate);
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  // 물리 정보 포맷팅 유틸
  const physical = enriched ?? book;
  const formatValue = (n?: number | null) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? `${n}` : '-');
  const sizeDisplay = `${formatValue(widthVal ?? physical?.width)} mm  ×  ${formatValue(heightVal ?? physical?.height)} mm  ×  ${formatValue(thicknessVal ?? physical?.thickness)} mm`;
  const weightDisplay = typeof (weightVal ?? physical?.weight) === 'number' && Number.isFinite(weightVal ?? physical?.weight) && (weightVal ?? physical?.weight)! > 0
    ? `${weightVal ?? physical?.weight} g`
    : '-';
  const pagesDisplay = typeof (pagesVal ?? physical?.pages) === 'number' && Number.isFinite(pagesVal ?? physical?.pages) && (pagesVal ?? physical?.pages)! > 0
    ? `${pagesVal ?? physical?.pages} p`
      : '-';

  const formatDate = (date: Date | null) => {
    if (!date) return '날짜 선택';
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleRatingLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setRatingWidth(width);
  };

  const handleSave = async () => {
    if (!book || isSaving) return;
    
    try {
      setIsSaving(true);
      // 물리 정보가 로딩 중이면 완료까지 대기
      if (isEnrichLoading && enrichPromiseRef.current) {
        try { await enrichPromiseRef.current; } catch (_) {}
      }
      // saveBookAndLog 함수 사용 (데이터베이스 저장 + store 추가까지 모두 처리)
      const saved = await saveBookAndLog({
        book,
        physical: enriched ?? undefined,
        kdc: enriched?.kdc ?? undefined,
        rate: rating,
        memo,
        startedAt: startDate,
        finishedAt: endDate,
      });

      Alert.alert('저장 완료', '기록이 저장되었습니다.');
      handleCloseModal();
      onSaveSuccess?.(saved);
    } catch (e: any) {
      console.error('save error', e);
      Alert.alert('저장 실패', e?.message ?? '잠시 후 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!book || !('record' in book) || !book.record || isSaving) return;
    
    try {
      setIsSaving(true);
      // 사용자 정보 먼저 확인
      const { data: userInfo, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userInfo?.user) {
        throw new Error('로그인이 필요합니다.');
      }

      const toISO = (d?: Date | null) => (d ? d.toISOString().split('T')[0] : null);
      await updateLogById(book.record.id, {
        rate: rating,
        memo,
        started_at: toISO(startDate),
        finished_at: toISO(endDate),
      });

      // 물리 정보 업데이트 (books 테이블)
      const physicalUpdates: Record<string, any> = {};
      const applyIfNumber = (key: 'width' | 'height' | 'thickness' | 'weight' | 'pages', value: number | null | undefined) => {
        if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
          physicalUpdates[key] = value;
        }
      };
      applyIfNumber('width', widthVal ?? book.width);
      applyIfNumber('height', heightVal ?? book.height);
      applyIfNumber('thickness', thicknessVal ?? book.thickness);
      applyIfNumber('weight', weightVal ?? book.weight);
      applyIfNumber('pages', pagesVal ?? book.pages);

      if (Object.keys(physicalUpdates).length > 0) {
        try {
          await updateBookById(book.id, physicalUpdates);
        } catch (e) {
          console.warn('물리 정보 업데이트 실패:', e);
        }
      }

      // 전역 store 업데이트 (rate/memo/기간 및 물리정보 반영)
      try {
        const store = useReadingLogsWithBooksStore.getState();
        const current = store.readingLogs.find((l) => l.id === String(book.record!.id));
        const toISO = (d?: Date | null) => (d ? d.toISOString().split('T')[0] : null);
        const updatesForStore: any = {
          rate: rating,
          memo,
          started_at: toISO(startDate),
          finished_at: toISO(endDate),
        };
        if (current?.book && Object.keys(physicalUpdates).length > 0) {
          updatesForStore.book = { ...current.book, ...physicalUpdates };
        }
        store.updateReadingLog(String(book.record.id), updatesForStore);
      } catch (e) {
        console.warn('store 업데이트 실패 (무시 가능):', e);
      }

      Alert.alert('수정 완료', '기록이 수정되었습니다.');
      handleCloseModal();
      onUpdateSuccess?.();
    } catch (e: any) {
      console.error('update error', e);
      Alert.alert('수정 실패', e?.message ?? '잠시 후 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!book || !('record' in book) || !book.record) return;
    
    Alert.alert(
      '기록 삭제',
      '이 독서 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLogById(book.record!.id);
              // 전역 store에서도 제거
              try {
                const store = useReadingLogsWithBooksStore.getState();
                store.removeReadingLog(String(book.record!.id));
              } catch (e) {
                console.warn('store 제거 실패 (무시 가능):', e);
              }
              Alert.alert('삭제 완료', '기록이 삭제되었습니다.');
              handleCloseModal();
              onDeleteSuccess?.();
            } catch (e: any) {
              console.error('delete error', e);
              Alert.alert('삭제 실패', e?.message ?? '잠시 후 다시 시도해주세요.');
            }
          }
        }
      ]
    );
  };

  if (!book) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleCloseModal}
    >
      {/* 모달 배경 */}
      <View className="flex-1 justify-center items-center bg-black/80">
        {/* 모달 전체 컨테이너 */}
        <View className="bg-gray800 rounded-2xl p-6 mx-4 w-11/12 border border-primary">
          {/* 책 정보 섹션 */}
          <View className="flex-row mb-6">
            {/* 왼쪽 이미지 */}
            <BookImage imageUrl={book.imageUrl} className="w-[80] h-[100] mr-2" />
            {/* 오른쪽 책 정보 */}
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

            {/* 물리 치수 섹션 */}
            {mode === 'view' && (
              <View className="mb-6 w-full rounded-lg py">
                {/* 사이즈: 너비, 높이, 두께 - 한 행에 가로 배치, 각 부분 인라인 편집 */}
                <View className="flex-row items-center justify-evenly mb-2 gap-x-2">
                  {/* 너비 */}
                  <TouchableOpacity
                    className="flex-1"
                    activeOpacity={0.8}
                    onPress={() => setEditingField('width')}
                  >
                      <View className="flex-row items-center">
                        <Text text="너비" type="body3" className="text-gray300 mr-1" />
                        {editingField === 'width'?
                        (<TextInput
                          keyboardType="numeric"
                          value={widthVal != null ? String(widthVal) : ''}
                          onChangeText={(t) => {
                            const n = Number(t.replace(/[^0-9.]/g, ''));
                            if (Number.isFinite(n)) setWidthVal(n);
                            if (t === '') setWidthVal(null);
                          }}
                          onBlur={() => { setEditingField(null); }}
                          onSubmitEditing={() => { setEditingField(null); Keyboard.dismiss(); }}
                          returnKeyType="done"
                          className="text-white text-sm"
                          placeholder="-"
                          placeholderTextColor={Colors.gray400}
                          autoFocus
                        />):
                        (
                          <Text text={`${formatValue(widthVal ?? physical?.width)}`} type="body3" className="text-white" />
                      )}
                        <Text text= "mm" type="body3" className="text-white" />
                      </View>
                  </TouchableOpacity>

                  {/* 높이 */}
                  <TouchableOpacity
                    className="flex-1"
                    activeOpacity={0.8}
                    onPress={() => setEditingField('height')}
                  >
                    <View className="flex-row items-center">
                      <Text text="높이" type="body3" className="text-gray300 mr-1" />
                      {editingField === 'height' ? (
                        <TextInput
                          keyboardType="numeric"
                          value={heightVal != null ? String(heightVal) : ''}
                          onChangeText={(t) => {
                            const n = Number(t.replace(/[^0-9.]/g, ''));
                            if (Number.isFinite(n)) setHeightVal(n);
                            if (t === '') setHeightVal(null);
                          }}
                          onBlur={() => { setEditingField(null); }}
                          onSubmitEditing={() => { setEditingField(null); Keyboard.dismiss(); }}
                          returnKeyType="done"
                          className="text-white text-sm"
                          placeholder="-"
                          placeholderTextColor={Colors.gray400}
                          autoFocus
                        />
                      ) : (
                        <Text text={`${formatValue(heightVal ?? physical?.height)}`} type="body3" className="text-white" />
                      )}
                      <Text text="mm" type="body3" className="text-white" />
                    </View>
                  </TouchableOpacity>

                  {/* 두께 */}
                  <TouchableOpacity
                    className="flex-1"
                    activeOpacity={0.8}
                    onPress={() => setEditingField('thickness')}
                  >
                    <View className="flex-row items-center">
                      <Text text="두께" type="body3" className="text-gray300 mr-1" />
                      {editingField === 'thickness' ? (
                        <TextInput
                          keyboardType="numeric"
                          value={thicknessVal != null ? String(thicknessVal) : ''}
                          onChangeText={(t) => {
                            const n = Number(t.replace(/[^0-9.]/g, ''));
                            if (Number.isFinite(n)) setThicknessVal(n);
                            if (t === '') setThicknessVal(null);
                          }}
                          onBlur={() => { setEditingField(null); }}
                          onSubmitEditing={() => { setEditingField(null); Keyboard.dismiss(); }}
                          returnKeyType="done"
                          className="text-white text-sm"
                          placeholder="-"
                          placeholderTextColor={Colors.gray400}
                          autoFocus
                        />
                      ) : (
                        <Text text={`${formatValue(thicknessVal ?? physical?.thickness)}`} type="body3" className="text-white" />
                      )}
                      <Text text="mm" type="body3" className="text-white" />
                    </View>
                  </TouchableOpacity>
                </View>
                {/* 무게, 페이지도 동일한 인라인 편집 레이아웃 */}
                <View className="flex-row items-center justify-evenly gap-x-4">
                  {/* 무게 */}
                  <TouchableOpacity
                    className="flex-1"
                    activeOpacity={0.8}
                    onPress={() => setEditingField('weight')}
                  >
                    <View className="flex-row items-center">
                      <Text text="무게" type="body3" className="text-gray300 mr-1" />
                      {editingField === 'weight' ? (
                        <TextInput
                          keyboardType="numeric"
                          value={weightVal != null ? String(weightVal) : ''}
                          onChangeText={(t) => {
                            const n = Number(t.replace(/[^0-9.]/g, ''));
                            if (Number.isFinite(n)) setWeightVal(n);
                            if (t === '') setWeightVal(null);
                          }}
                          onBlur={() => { setEditingField(null); }}
                          onSubmitEditing={() => { setEditingField(null); Keyboard.dismiss(); }}
                          returnKeyType="done"
                          className="text-white text-sm"
                          placeholder="-"
                          placeholderTextColor={Colors.gray400}
                          autoFocus
                        />
                      ) : (
                        <Text text={`${formatValue(weightVal ?? physical?.weight)}`} type="body3" className="text-white" />
                      )}
                      <Text text="g" type="body3" className="text-white" />
                    </View>
                  </TouchableOpacity>

                  {/* 페이지 */}
                  <TouchableOpacity
                    className="flex-1"
                    activeOpacity={0.8}
                    onPress={() => setEditingField('pages')}
                  >
                    <View className="flex-row items-center">
                      <Text text="페이지" type="body3" className="text-gray300 mr-1" />
                      {editingField === 'pages' ? (
                        <TextInput
                          keyboardType="numeric"
                          value={pagesVal != null ? String(pagesVal) : ''}
                          onChangeText={(t) => {
                            const n = Number(t.replace(/[^0-9.]/g, ''));
                            if (Number.isFinite(n)) setPagesVal(n);
                            if (t === '') setPagesVal(null);
                          }}
                          onBlur={() => { setEditingField(null); }}
                          onSubmitEditing={() => { setEditingField(null); Keyboard.dismiss(); }}
                          returnKeyType="done"
                          className="text-white text-sm"
                          placeholder="-"
                          placeholderTextColor={Colors.gray400}
                          autoFocus
                        />
                      ) : (
                        <Text text={`${formatValue(pagesVal ?? physical?.pages)}`} type="body3" className="text-white" />
                      )}
                      <Text text="p" type="body3" className="text-white" />
                    </View>
                  </TouchableOpacity>
            </View>
          </View>
            )}


          {/* Rating 섹션 */}
          <View 
            className="mb-6 w-full"
            onLayout={handleRatingLayout}
          >
            <Text text="평점" type="body2" className="text-white mb-3" />
            <View className="flex-row items-center relative justify-center items-center">
              <RNHorizontalSlider
                width={ratingWidth}
                height={36}
                value={rating}
                onChange={setRating}
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
              {/* 읽기 시작 날짜 */}
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
              {/* 읽기 완료 날짜 */}
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
            
            {/* 날짜 선택기 모달 */}
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

          {/* 버튼 섹션 */}
          <View className="flex-row">
            <Button 
            text="취소"
            onPress={handleCloseModal} 
            className="bg-gray700"
             />
            
            {mode === 'save' ? (
              <Button
              text="저장"
              onPress={handleSave}
              className="ml-4 bg-primary"
              disabled={isEnrichLoading || isSaving}
              isLoading={isEnrichLoading || isSaving}
              />
            ) : (
              <>
              <Button
              text="삭제"
              onPress={handleDelete}
              className="ml-2 opacity-80"
              />
              <Button
              text="수정"
              onPress={handleUpdate}
              className="ml-2 bg-primary"
              isLoading={isSaving}
              />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
