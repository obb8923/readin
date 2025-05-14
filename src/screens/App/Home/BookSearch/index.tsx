import React, { useState, useRef, useEffect } from 'react';
import { 
    View, Text, TextInput, ActivityIndicator, FlatList, 
    Alert, Image, TouchableOpacity, Button, Platform,
    Animated
} from 'react-native';
import { searchBooks } from '../../../../libs/supabase/kakaoBookSearch';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; // DateTimePicker import 추가
import Slider from '../../../../components/Slider'; 
import { saveReadingRecord, getCurrentUserId } from '../../../../libs/supabase/supabaseOperations'; // getCurrentUserId import 추가
import DefaultButton from '../../../../components/DefaultButton';
import { HomeStackParamList } from '../../../../nav/stack/Home';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Background from '../../../../components/Background';
// Book 인터페이스 정의 (이전 홈 화면에서 가져옴)
interface Book {
  isbn: string;
  title: string;
  authors: string[];
  thumbnail: string;
}
type BookSearchScreenProps = NativeStackScreenProps<HomeStackParamList, 'BookSearch'>;
export default function BookSearchScreen({navigation}: BookSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  // 모달 관련 상태
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Add state variables for reading details
  const [progress, setProgress] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [review, setReview] = useState('');

  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date()); // 임시 날짜 상태 추가

  // Slider Container Size State
  const [progressContainerSize, setProgressContainerSize] = useState<{width: number | null, height: number | null}>({ width: null, height: null });
  const [ratingContainerSize, setRatingContainerSize] = useState<{width: number | null, height: number | null}>({ width: null, height: null });

  // Refs for Slider Containers
  const progressContainerRef = useRef<View>(null);
  const ratingContainerRef = useRef<View>(null);


  useEffect(() => {
    // 탭바 숨기기
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    // cleanup: 스크린에서 나갈 때 탭바 다시 보이게
    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });
    };
  }, [isModalVisible]);
  // 검색 실행 함수 (이전 홈 화면에서 가져옴)
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    console.log(`Searching for: ${searchQuery}`);
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const response = await searchBooks(searchQuery);
      console.log("Search response:", response);
      if (response && response.documents) {
        setSearchResults(response.documents as Book[]);
      } else {
        setSearchResults([]);
      }
    } catch (error: any) {
      console.error("Search failed:", error);
      setSearchError(error.message || '책 검색 중 오류가 발생했습니다.');
      Alert.alert('검색 오류', error.message || '책 검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 책 아이템 클릭 시 모달 열기
  const handleBookPress = (book: Book) => {
    setSelectedBook(book);
    // 모달이 열릴 때 상태 초기화
    setProgress(0); // 진행도 초기화
    setRating(0); // 평점 초기화
    setStartDate(new Date()); // 시작일을 오늘 날짜로 초기화
    setEndDate(new Date()); // 종료일을 오늘 날짜로 초기화
    setReview(''); // 리뷰 초기화
    setShowDatePicker(false); // 날짜 선택기 숨기기
    setDatePickerTarget(null); // 날짜 선택기 타겟 초기화
    setIsModalVisible(true); // 모달 표시
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedBook(null);
    setShowDatePicker(false);
    setDatePickerTarget(null);
  };

 // --- 애니메이션 관련 ---
  const fadeAnim = useRef(new Animated.Value(0)).current; // 초기 투명도 0

   useEffect(() => {
    if (isModalVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300, // 0.3초 동안
        useNativeDriver: true, // 네이티브 드라이버 사용 권장
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300, // 0.3초 동안
        useNativeDriver: true, // 네이티브 드라이버 사용 권장
      }).start(() => {
        setProgress(0);
        setRating(0);
        setReview('');
        setStartDate(null);
        setEndDate(null);
        setShowDatePicker(false); // DatePicker도 함께 닫도록 처리
      });
    }
  }, [isModalVisible, fadeAnim]);

  // --- Date Picker Functions ---
  // Show the date picker section
  const showMode = (target: 'start' | 'end') => {
    const currentDate = target === 'start' ? startDate : endDate;
    setTempDate(currentDate || new Date()); // Initialize tempDate with current value or now
    setDatePickerTarget(target);
    setShowDatePicker(true); // Show the picker section
  };
  // Update tempDate when picker value changes
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // 안드로이드의 경우, 'dismissed'는 취소 또는 외부 탭을 의미합니다.
    // iOS의 경우, 외부 버튼이 있다면 'dismissed'는 spinner와 함께 일반적으로 사용되지 않습니다.
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      setDatePickerTarget(null);
      return;
    }

    // 안드로이드의 경우, 'set'은 확인을 의미합니다.
    // iOS의 경우, 사용자가 휠을 돌리면 selectedDate가 업데이트됩니다.
    if (selectedDate) {
      setTempDate(selectedDate); // 양쪽 플랫폼 모두 tempDate 업데이트

      if (Platform.OS === 'android' && event.type === 'set') {
        // 안드로이드에서 확인을 누르면 날짜를 확정하고 닫습니다.
        if (datePickerTarget === 'start') {
          setStartDate(selectedDate);
        } else if (datePickerTarget === 'end') {
          setEndDate(selectedDate);
        }
        setShowDatePicker(false);
        setDatePickerTarget(null);
      }
    }
  };
  // 날짜 선택 확인 (iOS용)
  const handleDateConfirm = () => {
    if (tempDate) {
      if (datePickerTarget === 'start') {
        setStartDate(tempDate);
      } else if (datePickerTarget === 'end') {
        setEndDate(tempDate);
      }
    }
    setShowDatePicker(false); //DateTimePicker 닫기
    setDatePickerTarget(null);
  };
  // --- End Date Picker Functions ---

  // Layout Handlers for Slider Containers
  const handleProgressLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setProgressContainerSize({ width, height });
  };

  const handleRatingLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setRatingContainerSize({ width, height });
  };

  const handleSave = async () => {
    console.log('저장하기 버튼 클릭');
    if (!selectedBook) return;

    try {
      //사용자 ID 가져오기
      const userId = await getCurrentUserId();

      if (!userId) {
        console.error('사용자 ID를 가져올 수 없습니다.');
        Alert.alert('오류', '사용자 정보를 확인하는데 실패했습니다. 다시 로그인 해주세요.');
        // navigation.navigate('Login');
        return;
      }
      // --- Supabase에 저장할 데이터 준비 ---
      const recordData = {
        user_id: userId,
        isbn: selectedBook.isbn,
        title: selectedBook.title,
        authors: selectedBook.authors || [],
        image_url: selectedBook.thumbnail || '',
        progress: Math.round(progress),
        rating: Math.round(rating),
        start_date: startDate ? startDate.toISOString().split('T')[0] : null,
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        review: review,
      };

      // --- 1. Supabase에 데이터 저장 함수 호출 ---
      const { success, error: saveError } = await saveReadingRecord(recordData);

      if (!success) {
        console.error('Supabase 저장 실패:', saveError);
        Alert.alert('저장 실패', `데이터 저장 중 오류가 발생했습니다: ${saveError?.message || '알 수 없는 오류'}`);
        return;
      }
      // 저장 성공 알림
      Alert.alert('저장 완료', '독서 기록이 성공적으로 저장되었습니다.');
      closeModal(); // 2. 모달 닫기
      navigation.reset({ // 3. 홈 화면으로 이동 (스택 초기화)
        index: 0,
        routes: [{ name: 'Home' }],
      });


    } catch (error: any) {
      console.error('handleSave 함수 오류:', error);
      Alert.alert('저장 실패', '알 수 없는 오류가 발생했습니다.');
    }
  };

  return (
    <Background>
      {/* 검색 화면 전체 컨테이너 */}
      <View className="flex-1 p-4">

      {/* 검색 Input */}
      <TextInput
        className="h-12 bg-white border border-gray-300 rounded-lg mb-4 px-4 text-base"
        placeholder="검색할 책 제목 입력 후 Enter"
        placeholderTextColor="#9ca3af"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
        autoFocus={true} // 화면 진입 시 자동으로 포커스
      />

      {/* 검색 결과 표시 영역 */}
      <View className="flex-1 bg-white rounded-lg border border-gray-200 px-4 pt-4">
        {isSearching ? (
          <ActivityIndicator size="large" className="mt-5" />
        ) : searchError ? (
          <Text className="text-red-500 text-center mt-5 font-p">{searchError}</Text>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => `${item.isbn || item.title}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleBookPress(item)}>
                <View className="flex-row mb-4 pb-4 border-b border-gray-100 items-center">
                  {item.thumbnail ? (
                    <Image source={{ uri: item.thumbnail }} className="w-12 h-16 mr-4" resizeMode="contain" />
                  ) : (
                    <View className="w-12 h-16 mr-4 bg-gray-200 justify-center items-center">
                      <Text className="text-xs text-gray-400 font-p">No Img</Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-base font-p mb-1" numberOfLines={2}>{item.title}</Text>
                    <Text className="text-sm text-gray-600 font-p">{item.authors?.join(', ')}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text className="text-gray-500 text-center mt-5">검색 결과가 여기에 표시됩니다.</Text>
        )}
      </View>
</View>
      {/* 모달 */}
        <Animated.View
        className="absolute flex-1 w-full h-full bg-black/50 items-center justify-center"
         style={{ opacity: fadeAnim }}
         pointerEvents={isModalVisible ? 'auto' : 'none'}
        >
        {/* 모달 전체 컨테이너 */}
          <View className="w-11/12 h-auto bg-white rounded-xl">
          {/* 모달 내부 컨테이너 contents배치됨 */}
          <View className='w-full h-auto rounded-xl p-6 items-center'>
            {selectedBook && (
              <>
              {/* 책 정보 영역 */}
              <View className="flex-row items-start mb-2 w-full">
                {/* 책 썸네일 이미지 (왼쪽) */}
                <View className="mr-4">
                  {selectedBook.thumbnail ? (
                    <Image
                      source={{ uri: selectedBook.thumbnail }}
                      className="w-24 h-32"
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="w-24 h-32 bg-gray-200 justify-center items-center">
                      <Text className="text-xs text-gray-400 font-p">No Img</Text>
                    </View>
                  )}
                </View>

                {/* 책 제목, 저자 */}
                <View className="flex-1">
                  <Text className="text-lg mb-1 font-bold" numberOfLines={2}>{selectedBook.title}</Text>
                  <Text className="text-sm mb-2 text-gray-600 font-p" numberOfLines={1}>{selectedBook.authors?.join(', ')}</Text>
                  <Text className="text-xs mb-2 text-gray-500 font-p">{`ISBN: ${selectedBook.isbn}`}</Text>
                </View>
              </View>

                {/* 진행도 - Updated Layout with Slider */}
                <View className="w-full mt-2">
                  <View
                    ref={progressContainerRef}
                    onLayout={handleProgressLayout}
                    className="relative w-full h-10"
                  >
                    
                    {progressContainerSize.width && progressContainerSize.height && (
                      <>
                        <Slider
                          min={0}
                          max={100}
                          width={progressContainerSize.width}
                          height={progressContainerSize.height}
                          onChange={setProgress}
                        />
                     <View className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center" style={{pointerEvents: 'none'}}>
                           {/* pointer-events-none to allow slider interaction */}
                          <Text className="text-sm font-semibold text-black">
                             {`${Math.round(progress)}% 읽었어요`}
                          </Text>
                        </View>
                      </>
                    )}            
                  </View>
                </View>

                {/* 평점 - Updated Layout with Slider */}
                <View className="w-full mt-4">
                  <View
                    ref={ratingContainerRef}
                    onLayout={handleRatingLayout}
                    className="relative w-full h-10"
                  >
                    {ratingContainerSize.width && ratingContainerSize.height && (
                      <>
                        <Slider
                          min={0}
                          max={100}
                          width={ratingContainerSize.width}
                          height={ratingContainerSize.height}
                          onChange={setRating}
                        />
                        <View className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center" style={{pointerEvents: 'none'}}>
                           {/* pointer-events-none to allow slider interaction */}
                          <Text className="text-sm font-semibold text-black">
                             {`${Math.round(rating)}점 경험이었어요`}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>

                {/* 시작일/종료일  */}
                <View className="w-full mt-4 flex-row items-center justify-between">
                  <TouchableOpacity
                    className="border border-gray-300 rounded p-2 flex-1 h-10 justify-center mr-1"
                    onPress={() => showMode('start')}
                  >
                    <Text className={startDate ? 'text-black text-center font-p' : 'text-gray-400 text-center font-p'}>
                      {startDate ? startDate.toLocaleDateString() : '시작일 선택'}
                    </Text>
                  </TouchableOpacity>
                  <Text className="mx-1 font-p">부터</Text> 
                  <TouchableOpacity
                    className="border border-gray-300 rounded p-2 flex-1 h-10 justify-center ml-1"
                    onPress={() => showMode('end')}
                  >
                    <Text className={endDate ? 'text-black text-center font-p' : 'text-gray-400 text-center font-p'}>
                      {endDate ? endDate.toLocaleDateString() : '종료일 선택'}
                    </Text>
                  </TouchableOpacity>
                   <Text className="ml-2 font-p">까지 읽음</Text> 
                </View>

                  {/* 간단 리뷰 */}
         <View className="w-full mt-4 mb-4">
           <TextInput
             className="border border-gray-300 rounded p-2 w-full h-24"
             placeholder="간단한 리뷰를 남길 수 있어요(선택)"
             multiline
             value={review}
             onChangeText={setReview}
             textAlignVertical="top"
             maxLength={300}
           />
           <Text className="absolute bottom-0 right-1 text-xs text-gray-500 font-p">
             {review.length}/300
           </Text>
         </View>
                {/* Buttons */}
                <View className="w-full mt-4 flex-row justify-between items-center">
                  {/* Spacer to prevent button overlap when picker is hidden */}
                  {!showDatePicker && <View style={{ height: 10 }} />}
                  <View className="flex-1 mr-2"> 
                    <DefaultButton title="닫기" onPress={closeModal} type='info'/>
                  </View>
                   {/* 저장하기 버튼 */}
                  <View className="flex-1 ml-2"> 
                    <DefaultButton title="저장하기" onPress={handleSave} />
                  </View>
                </View>
              </>
            )}
          </View>
              {/* Date Picker Section */}
              {showDatePicker && (
                    <View className={`absolute flex-col top-0 left-0 right-0 bottom-0 w-full items-center rounded-xl ${Platform.OS === 'ios' ? 'bg-black/50' : ''}`}>
                       <View className='flex-1 w-full h-full'/>
                        <View className='flex w-full rounded-xl bg-white justify-center items-center pb-[20]'>
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={tempDate}
                            mode={'date'}
                            is24Hour={true}
                            display={ 'spinner'}
                            onChange={onDateChange}
                            style={Platform.OS === 'ios' ? { width: '100%', height: 150 , backgroundColor: 'white'} : {}}
                        />
                            {Platform.OS === 'ios' && <Button title="확인" onPress={handleDateConfirm} />}
                        </View>
                    </View>
                )}
          </View>
        </Animated.View>
    </Background>
  );
} 