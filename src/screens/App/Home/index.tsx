import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert, Dimensions, TextInput, Button, Platform, LayoutChangeEvent, Animated } from 'react-native';
import { fetchUserReviews, ReviewWithBook, updateReview, deleteReview } from '../../../libs/supabase/supabaseOperations'; 
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; 
import Slider from '../../../components/Slider';
import DefaultButton from '../../../components/DefaultButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../nav/stack/Home';
import SearchIcon from '../../../../assets/svgs/Search.svg';
import GridIcon from '../../../../assets/svgs/Grid.svg';
import ListIcon from '../../../../assets/svgs/List.svg';
import Background from '../../../components/Background';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../../../constants/Colors';
// 화면 너비 가져오기 (책장형 레이아웃 계산용)
const screenWidth = Dimensions.get('window').width;
const numColumnsBookshelf = 4; // 책장형 열 개수
const bookshelfItemMargin = 8; // 아이템 간 마진
// 부모 View (p-4)의 좌우 패딩 합 (1rem = 16px 가정, 16px * 2 = 32px)
const parentHorizontalPadding = 32;
const availableWidthForFlatList = screenWidth - parentHorizontalPadding;
// 각 아이템의 순수 너비 계산: (사용 가능 너비 / 컬럼 수) - (아이템 좌우 마진 합)
const bookshelfItemSize = (availableWidthForFlatList / numColumnsBookshelf) - (2 * bookshelfItemMargin);
type HomeScreenProps = NativeStackScreenProps<
HomeStackParamList,
'Home'
>;
export default function HomeScreen({navigation}: HomeScreenProps) {
  const [reviews, setReviews] = useState<ReviewWithBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'bookshelf'>('list'); // 보기 모드 상태

  // --- 모달 관련 상태 ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewWithBook | null>(null);
  const [progress, setProgress] = useState(0); // 모달 내 진행도
  const [rating, setRating] = useState(0);     // 모달 내 평점
  const [review, setReview] = useState('');    // 모달 내 리뷰 텍스트
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [tempDate, setTempDate] = useState(new Date()); // 임시 날짜 저장

  // 리뷰 로딩 함수
  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await fetchUserReviews();
    if (error) {
      console.log('리뷰 로딩 오류:', error);
      // router.push('/login');
    } else if (data) {
      setReviews(data);
    }
    setIsLoading(false);
  }, []); 

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [loadReviews])
  );

  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });

  }, []);

  // --- 애니메이션 관련 ---
  const fadeAnim = useRef(new Animated.Value(0)).current; // 초기 투명도 0

  // --- 슬라이더 레이아웃 계산용 ---
  const [progressContainerSize, setProgressContainerSize] = useState({ width: 0, height: 0 });
  const [ratingContainerSize, setRatingContainerSize] = useState({ width: 0, height: 0 });

  const handleProgressLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setProgressContainerSize({ width, height });
  };

  const handleRatingLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setRatingContainerSize({ width, height });
  };

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
        setSelectedReview(null);
        setProgress(0);
        setRating(0);
        setReview('');
        setStartDate(null);
        setEndDate(null);
        setShowDatePicker(false); // DatePicker도 함께 닫도록 처리
      });
    }
  }, [isModalVisible, fadeAnim]);

  // --- 모달 열기 ---
  const openModal = (item: ReviewWithBook) => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    setSelectedReview(item);
    setProgress(item.progress || 0);
    setRating(item.rating || 0);
    setReview(item.review || '');
    setStartDate(item.start_date ? new Date(item.start_date) : null);
    setEndDate(item.end_date ? new Date(item.end_date) : null);
    setIsModalVisible(true);
  };

  // --- 모달 닫기 ---
  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });
    }, 300);
  };

  // --- 날짜 관련 함수 ---
  const showMode = (modeToShow: 'start' | 'end') => {
    setDatePickerMode(modeToShow);
    // 현재 설정된 날짜 또는 오늘 날짜로 초기화
    const currentDate = modeToShow === 'start' ? startDate : endDate;
    setTempDate(currentDate || new Date());
    setShowDatePicker(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false); // Android에서는 선택 즉시 피커가 닫힘
    }
    if (selectedDate) {
      setTempDate(selectedDate); // iOS에서는 확인 버튼 누르기 전까지 임시 저장
      // Android에서는 바로 적용
      if (Platform.OS === 'android') {
        if (datePickerMode === 'start') {
          setStartDate(selectedDate);
        } else {
          setEndDate(selectedDate);
        }
      }
    }
  };

  const handleDateConfirm = () => { // iOS용 확인 버튼 핸들러
    if (datePickerMode === 'start') {
      setStartDate(tempDate);
    } else {
      setEndDate(tempDate);
    }
    setShowDatePicker(false);
  };

  // --- 저장 기능 ---
  const handleSave = async () => {
    if (!selectedReview) return;

    const updatedData = {
      progress: Math.round(progress),
      rating: Math.round(rating),
      start_date: startDate ? startDate.toISOString().split('T')[0] : null,
      end_date: endDate ? endDate.toISOString().split('T')[0] : null,
      review: review,
    };

    console.log('저장 시도:', selectedReview.id, updatedData); // 디버깅 로그

    const { success, error } = await updateReview(selectedReview.id, updatedData);

    if (success) {
      // 로컬 상태 업데이트
      setReviews(prevReviews =>
        prevReviews.map(r =>
          r.id === selectedReview.id ? { ...r, ...updatedData } : r
        )
      );
      closeModal();
    } else {
      console.error('리뷰 업데이트 오류:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error ? String(error.message) : '알 수 없는 오류';
      Alert.alert('오류', `리뷰 업데이트 중 오류가 발생했습니다: ${errorMessage}`);
    }
  };

    // --- 삭제 기능 ---
    const handleDelete = async () => {
        if (!selectedReview) return;

        Alert.alert(
            "리뷰 삭제",
            "정말로 이 리뷰를 삭제하시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                {
                    text: "삭제",
                    onPress: async () => {
                        console.log('삭제 시도:', selectedReview.id); // 디버깅 로그
                        const { success, error } = await deleteReview(selectedReview.id);

                        if (success) {
                            // 로컬 상태 업데이트
                            setReviews(prevReviews => prevReviews.filter(r => r.id !== selectedReview.id));
                            Alert.alert('성공', '리뷰가 삭제되었습니다.');
                            closeModal();
                        } else {
                            console.error('리뷰 삭제 오류:', error);
                            const errorMessage = error && typeof error === 'object' && 'message' in error ? String(error.message) : '알 수 없는 오류';
                            Alert.alert('오류', `리뷰 삭제 중 오류가 발생했습니다: ${errorMessage}`);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

  // --- 리스트형 아이템 렌더러 ---
  const renderReviewItem = ({ item }: { item: ReviewWithBook }) => {
    const progressWidth = item.progress || 0;
    const rating = Math.max(0, Math.min(100, item.rating || 0));
    const bgOpacity = rating <= 10 ? 0.1 : rating / 100;

    return (
      <TouchableOpacity onPress={() => openModal(item)}>
        <View className="bg-transparent mb-3 rounded-lg overflow-hidden h-12 justify-center relative">
          {/* 진행도 및 평점 배경 */}
          <View
            className={`absolute top-0 left-0 right-0 bottom-0 bg-skyblue`}
            style={{ width: `${progressWidth}%`, opacity: bgOpacity }}
          />
          <Text
            className="text-base font-semibold z-10 px-3"
            numberOfLines={1}
          >
            {item.books?.title || '제목 없음'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // --- 책장형 아이템 렌더러 ---
  const renderBookshelfItem = ({ item }: { item: ReviewWithBook }) => (
    <TouchableOpacity
      style={{ width: bookshelfItemSize, height: bookshelfItemSize * 1.5, margin: bookshelfItemMargin }}
      onPress={() => openModal(item)} // 클릭 시 모달 열기
    >
      {item.books?.image_url ? (
        <Image
          source={{ uri: item.books.image_url }}
          className="w-full h-full rounded-md bg-gray-200" // 이미지 없을 때 대비 배경색
          resizeMode="cover"
        />
      ) : (
        // 이미지 URL 없을 때 플레이스홀더
        <View className="w-full h-full rounded-md bg-gray-300 items-center justify-center">
          {/* <Ionicons name="image-outline" size={40} color="#9ca3af" /> */}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Background style={{}}>
      {/* 내부 컨테이너 */}
      <View className="flex-1 p-4">
      {/* 책 추가 버튼 */}
      <TouchableOpacity
        className="flex-row items-center h-12 bg-white border border-gray-300 rounded-lg mb-4 px-3"
        onPress={() => navigation.navigate('BookSearch')}
      >
        <SearchIcon className="w-6 h-6" style={{marginRight: 8, color: '#9ca3af'}}/>
        <Text className="font-p text-base text-gray-400">읽은 책 추가하기...</Text>
      </TouchableOpacity>

      {/* 컨트롤 영역: 책 개수 및 보기 모드 전환 */}
      {!isLoading && reviews.length > 0 && (
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="font-p text-sm text-gray-600">총 {reviews.length}권</Text>
          <View className="flex-row items-center justify-center">
            <TouchableOpacity onPress={() => setViewMode('list')}>
              <ListIcon style={{color: viewMode === 'list' ? '#191919' : '#9ca3af'}} className={`w-6 h-6`} />
            </TouchableOpacity>
            <View className='w-3'/>
            <TouchableOpacity onPress={() => setViewMode('bookshelf')}>
              <GridIcon style={{color: viewMode === 'bookshelf' ? '#191919' : '#9ca3af'}} className={`w-6 h-6`} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 콘텐츠 영역: 로딩, 빈 상태, 리스트/책장 */}
      <View className="flex-1">
        {isLoading ? (
          <ActivityIndicator size="large" color="#6b7280" className="mt-10" />
        ) : reviews.length === 0 ? (
          <Text className="text-gray-500 text-center mt-10 text-base font-p">아직 추가된 책이 없습니다.</Text>
        ) : viewMode === 'list' ? (
          // --- 리스트형 보기 ---
          <FlatList
            key={`flatlist-${viewMode}`}
            data={reviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => `list-${item.id?.toString() || item.isbn}`}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        ) : (
          // --- 책장형 보기 ---
          <FlatList
            key={`flatlist-${viewMode}`}
            data={reviews}
            renderItem={renderBookshelfItem}
            keyExtractor={(item) => `shelf-${item.id?.toString() || item.isbn}`}
            numColumns={numColumnsBookshelf}
            contentContainerStyle={{ paddingBottom: 16 }}
            // columnWrapperStyle={{ justifyContent: 'space-around' }} // 또는 마진으로 조절
          />
        )}
      </View>
      </View>
      {/* 모달 */}
      <Animated.View
        className="absolute flex-1 w-full h-full bg-black/50 items-center justify-center"
        style={{ opacity: fadeAnim }}
        pointerEvents={isModalVisible ? 'auto' : 'none'} // 모달 표시 여부에 따라 터치 이벤트 제어
      >
        <View className="w-11/12 h-auto bg-white rounded-xl p-6">
        {selectedReview && (
       <>
         {/* 책 정보 영역 */}
         <View className="flex-row items-start mb-4">
           {/* 책 썸네일 이미지 */}
           <View className="mr-4">
             {selectedReview.books?.image_url ? (
               <Image
                 source={{ uri: selectedReview.books.image_url }}
                 className="w-24 h-36 rounded"
                 resizeMode="cover"
               />
             ) : (
               <View className="w-24 h-36 bg-gray-200 rounded justify-center items-center">
                  {/* <Ionicons name="image-sharp" size={30} color="#9ca3af" /> */}
               </View>
             )}
           </View>

           {/* 책 제목, 저자, ISBN */}
           <View className="flex-1">
             <Text className="text-lg font-bold mb-1" numberOfLines={2}>{selectedReview.books?.title || '제목 없음'}</Text>
             <Text className="text-sm text-gray-600 mb-2 font-p" numberOfLines={1}>{selectedReview.books?.author || '저자 정보 없음'}</Text>
             <Text className="text-xs text-gray-500 font-p">{`ISBN: ${selectedReview.isbn}`}</Text>
           </View>
         </View>

         {/* 진행도 - Updated Layout with Slider */}
         <View className="w-full mt-2">
           <View
             onLayout={handleProgressLayout}
             className="relative w-full h-10"
           >
             <Slider
               min={0}
               max={100}
               width={progressContainerSize.width}
               height={progressContainerSize.height}
               onChange={setProgress}
               value={progress}
             />
             <View className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center" style={{pointerEvents: 'none'}}>
               <Text className="text-sm font-semibold text-black">
                  {`${Math.round(progress)}% 읽었어요`}
               </Text>
             </View>
           </View>
         </View>

         {/* 평점 - Updated Layout with Slider */}
         <View className="w-full mt-4">
           <View
             onLayout={handleRatingLayout}
             className="relative w-full h-10"
           >
             <Slider
               min={0}
               max={100}
               width={ratingContainerSize.width}
               height={ratingContainerSize.height}
               onChange={setRating}
               value={rating}
             />
             <View className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center" style={{pointerEvents: 'none'}}>
               <Text className="text-sm font-semibold text-black">
                  {`${Math.round(rating)}점 경험이었어요`}
               </Text>
             </View>
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
             className="border border-gray-300 rounded p-2 w-full h-24 font-p"
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

         {/* 버튼 영역 */}
         <View className="w-full flex-row justify-between items-center">
           <DefaultButton
               title="삭제하기"
               onPress={handleDelete}
               type="delete"
               className="w-auto"
           />
                <DefaultButton
               title="닫기"
               onPress={closeModal}
               type="info"
               className="w-auto" 
           />
                <DefaultButton
               title="저장하기"
               onPress={handleSave}
               className="w-auto"
           />
         </View>
       </>
     )}
        </View>
        {showDatePicker && (
             <View className="absolute flex-col top-0 left-0 right-0 bottom-0 w-full bg-black/50 items-center rounded-xl">
                <View className='flex-1 w-full h-full'/>
                 <View className='flex w-full rounded-xl bg-white justify-center items-center pb-[20]'>
                 <DateTimePicker
                     testID="dateTimePicker"
                     value={tempDate}
                     mode={'date'}
                     is24Hour={true}
                     display={'spinner'}
                     onChange={onDateChange}
                     style={Platform.OS === 'ios' ? { width: '100%', height: 150 , backgroundColor: 'white'} : {}}
                 />
                 {Platform.OS === 'ios' && (
                     <Button title="확인" onPress={handleDateConfirm} />
                 )}
                 </View>
             </View>
         )}
      </Animated.View>
    </Background>
  );
}

