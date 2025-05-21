import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Image, LayoutChangeEvent, Alert,Platform, Button, TextInput, ActivityIndicator } from 'react-native';
import { useModalStore } from '../store/modalStore';
import Slider from './Slider';
import DefaultButton from './DefaultButton';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Book, getCurrentUserId, ReviewWithBook, saveReadingRecord } from '../libs/supabase/supabaseOperations';
import { updateReview, deleteReview } from '../libs/supabase/supabaseOperations';
import useReviewStore from '../store/reviewStore';
import { HomeStackParamList } from '../nav/stack/Home';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Asset, launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { supabase } from '../libs/supabase/supabase';
import ReactNativeFS from 'react-native-fs';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import Colors from '../constants/Colors';

// --- 모달 내 이미지 표시를 위한 헬퍼 컴포넌트 ---
interface ModalImageDisplayProps {
  imageUrlOrPath: string | null | undefined;
  style?: object; // Image 컴포넌트에 적용할 스타일
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

const ModalImageDisplay = ({ imageUrlOrPath, style, resizeMode = "cover" }: ModalImageDisplayProps) => {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSupabasePath = (path: string) => {
    return path && !path.startsWith('http://') && !path.startsWith('https://');
  };

  useEffect(() => {
    if (imageUrlOrPath) {
      if (isSupabasePath(imageUrlOrPath)) {
        const fetchSignedUrl = async () => {
          setIsLoading(true);
          setDisplayUrl(null);
          try {
            const { data, error } = await supabase.storage
              .from('book-thumbnail')
              .createSignedUrl(imageUrlOrPath, 3600); // 1시간 유효
            if (error) {
              console.error('Error fetching signed URL for modal image:', imageUrlOrPath, error);
              setDisplayUrl(null);
            } else {
              setDisplayUrl(data?.signedUrl || null);
            }
          } catch (e) {
            console.error('Exception fetching signed URL for modal image:', imageUrlOrPath, e);
            setDisplayUrl(null);
          }
          setIsLoading(false);
        };
        fetchSignedUrl();
      } else {
        // 외부 URL인 경우 그대로 사용
        setDisplayUrl(imageUrlOrPath);
        setIsLoading(false);
      }
    } else {
      setDisplayUrl(null);
      setIsLoading(false);
    }
  }, [imageUrlOrPath]);

  if (isLoading) {
    return (
      <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }]}>
        <ActivityIndicator size="small" color={Colors.svggray} />
      </View>
    );
  }

  if (!displayUrl) {
    return (
      <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }]}>
        <Text className="text-gray-400 font-p">썸네일 없음</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: displayUrl }}
      style={style}
      resizeMode={resizeMode}
      onError={(e) => {
        console.warn('Error loading image in modal:', displayUrl, e.nativeEvent.error);
        setDisplayUrl(null); // 오류 발생 시 플레이스홀더로 전환
      }}
    />
  );
};

// ISBN 유효성 검사 함수들
const isValidIsbn10 = (isbn: string): boolean => {
  if (isbn.length !== 10) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    if (isNaN(parseInt(isbn[i]))) return false; // 숫자가 아니면 false
    sum += parseInt(isbn[i]) * (i + 1);
  }
  const checksum = sum % 11;
  const lastChar = isbn[9].toUpperCase();
  if (lastChar === 'X') {
    return checksum === 10;
  } else if (!isNaN(parseInt(lastChar))) {
    return checksum === parseInt(lastChar);
  } else {
    return false; // 마지막 문자가 X도 아니고 숫자도 아니면 false
  }
};

const isValidIsbn13 = (isbn: string): boolean => {
  if (isbn.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    if (isNaN(parseInt(isbn[i]))) return false; // 숫자가 아니면 false
    const weight = (i % 2 === 0) ? 1 : 3;
    sum += parseInt(isbn[i]) * weight;
  }
  const checksum = (10 - (sum % 10)) % 10;
  if (isNaN(parseInt(isbn[12]))) return false; // 마지막 문자가 숫자가 아니면 false
  return checksum === parseInt(isbn[12]);
};

const Modal = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { isVisible, modalType, reviewWithBook, book, hide } = useModalStore();
  const { fetchReviews } = useReviewStore();

  // --- 모달 관련 상태 (초기값은 기본값으로) ---
  const [selectedReview, setSelectedReview] = useState<ReviewWithBook | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState(''); // review -> reviewText 로 변경
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [tempDate, setTempDate] = useState(new Date()); // 임시 날짜 저장

  // --- addBook 모달용 상태 변수 ---
  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [isbnInput, setIsbnInput] = useState('');
  const [imageUriInput, setImageUriInput] = useState<string | undefined>(undefined); // 선택된 이미지의 로컬 URI 또는 업로드된 URL
  const [selectedImageObject, setSelectedImageObject] = useState<Asset | null>(null); // 선택된 이미지 파일 정보 from react-native-image-picker

  //애니메이션 관련
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
    if (isVisible) {
        if (modalType === 'modifyReview') {
            setSelectedReview(reviewWithBook);
            setProgress(reviewWithBook?.progress ?? 0);
            setRating(reviewWithBook?.rating ?? 0);
            setReviewText(reviewWithBook?.review ?? '');
            setStartDate(reviewWithBook?.start_date ? new Date(reviewWithBook.start_date) : null);
            setEndDate(reviewWithBook?.end_date ? new Date(reviewWithBook.end_date) : null);
            setSelectedBook(null);
            // addBook 관련 상태 초기화 (혹시 모르니)
            setTitleInput('');
            setAuthorInput('');
            setIsbnInput('');
            setImageUriInput(undefined);
            setSelectedImageObject(null);
        }
        if (modalType === 'addReview') {
            setSelectedReview(null);
            setSelectedBook(book);
            setProgress(0);
            setRating(0);
            setReviewText(''); 
            setStartDate(new Date());
            setEndDate(new Date());
            // addBook 관련 상태 초기화
            setTitleInput('');
            setAuthorInput('');
            setIsbnInput('');
            setImageUriInput(undefined);
            setSelectedImageObject(null);
        }
        if (modalType === 'addBook') {
            // addBook 모달 상태 초기화
            setSelectedReview(null);
            setSelectedBook(null);
            setProgress(0);
            setRating(0);
            setReviewText('');
            setStartDate(new Date());
            setEndDate(new Date());
            setTitleInput('');
            setAuthorInput('');
            setIsbnInput('');
            setImageUriInput(undefined);
            setSelectedImageObject(null); 
        }

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
        // 애니메이션 완료 후 상태 초기화
        setSelectedReview(null);
        setProgress(0);
        setRating(0);
        setReviewText('');
        setStartDate(null);
        setEndDate(null);
        setShowDatePicker(false); // DatePicker도 함께 닫도록 처리
        // addBook 모달 상태 초기화
        setTitleInput('');
        setAuthorInput('');
        setIsbnInput('');
        setImageUriInput(undefined);
        setSelectedImageObject(null);
      });
    }
  }, [isVisible, reviewWithBook, book, fadeAnim]);

  // --- 날짜 관련 함수 ---
  const showMode = (modeToShow: 'start' | 'end') => {
    setDatePickerMode(modeToShow);
    const currentDate = modeToShow === 'start' ? startDate : endDate;
    setTempDate(currentDate || new Date());
    setShowDatePicker(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false); 
    }
    if (selectedDate) {
      setTempDate(selectedDate); 
      if (Platform.OS === 'android') {
        if (datePickerMode === 'start') {
          setStartDate(selectedDate);
        } else {
          setEndDate(selectedDate);
        }
      }
    }
  };

  const handleDateConfirm = () => { 
    if (datePickerMode === 'start') {
      setStartDate(tempDate);
    } else {
      setEndDate(tempDate);
    }
    setShowDatePicker(false);
  };

  const handleSaveNewBook = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        Alert.alert('오류', '사용자 ID를 가져올 수 없습니다. 다시 로그인 해주세요.');
        return;
      }

      // 1. 입력 값 유효성 검사 (제목, 저자, ISBN은 필수)
      if (!titleInput.trim() || !authorInput.trim() || !isbnInput.trim()) {
        Alert.alert('오류', '제목, 저자, ISBN을 모두 입력해주세요.');
        return;
      }

      // ISBN 유효성 검사 강화 (체크섬 포함)
      const cleanedIsbn = isbnInput.replace(/[-\s]/g, ''); // 하이픈 및 공백 제거
      
      let isValid = false;
      if (cleanedIsbn.length === 10) {
        isValid = isValidIsbn10(cleanedIsbn);
      } else if (cleanedIsbn.length === 13) {
        isValid = isValidIsbn13(cleanedIsbn);
      } else {
        Alert.alert('오류', 'ISBN은 10자리 또는 13자리여야 합니다 (하이픈/공백 제외).');
        return;
      }

      if (!isValid) {
        Alert.alert('오류', '유효하지 않은 ISBN입니다. 확인 후 다시 시도해주세요.');
        return;
      }

      let uploadedImagePath = ''; // 업로드된 이미지의 경로를 저장할 변수

      // 2. 이미지 업로드 (selectedImageObject가 있을 경우)
      if (selectedImageObject && selectedImageObject.uri) {
        console.log('ReactNativeFS object:', ReactNativeFS);
        console.log('Selected image URI:', selectedImageObject.uri);

        const fileUri = selectedImageObject.uri;
        const extension = selectedImageObject.fileName?.split('.').pop() || 'jpg';
        const fileName = `${isbnInput.trim()}.${extension}`;
        const fileType = selectedImageObject.type || 'image/jpeg';

        const base64Data = await ReactNativeFS.readFile(fileUri, 'base64');
        console.log('Base64 data length:', base64Data.length);
        
        const arrayBuffer = decodeBase64(base64Data);
        console.log('ArrayBuffer length:', arrayBuffer.byteLength);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('book-thumbnail')
          .upload(fileName, arrayBuffer, { 
            contentType: fileType,
            upsert: true,
          });

        if (uploadError) {
          console.error('Supabase 이미지 업로드 실패:', uploadError);
          Alert.alert('이미지 업로드 실패', `이미지 업로드 중 오류가 발생했습니다: ${uploadError.message}`);
          return; 
        }

        if (uploadData) {
          uploadedImagePath = uploadData.path; // 공개 URL 대신 경로(path)를 저장
          console.log('[Modal.tsx] Uploaded Image Path to be stored:', uploadedImagePath);
        }
      } 
      // 이미지가 선택되지 않은 경우 uploadedImagePath는 빈 문자열로 유지됨

      // 3. 독서 기록 데이터 준비 (책 정보 포함)
      const recordData = {
        user_id: userId,
        isbn: isbnInput.trim(),
        title: titleInput.trim(),
        authors: authorInput.split(',').map(author => author.trim()),
        image_url: uploadedImagePath, // 이미지 경로 저장 (공개 URL 아님)
        progress: Math.round(progress),
        rating: Math.round(rating),
        start_date: startDate ? startDate.toISOString().split('T')[0] : null,
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        review: reviewText,
      };

      // 4. 데이터베이스에 저장 (saveReadingRecord 함수 사용)
      console.log('[Modal.tsx] Attempting to save reading record with data (image_url is now a path):', recordData);
      const { success, error: saveError } = await saveReadingRecord(recordData);

      if (success) {
        Alert.alert('저장 완료', '새로운 책과 독서 기록이 성공적으로 저장되었습니다.');
        hide(); // 모달 닫기
        fetchReviews(); // 홈 화면 리뷰 목록 새로고침 (필요하다면)
        // navigation.reset({ index: 0, routes: [{ name: 'Home' }] }); // 필요하다면 홈으로 이동
      } else {
        console.error('Supabase 저장 실패:', saveError);
        Alert.alert('저장 실패', `데이터 저장 중 오류가 발생했습니다: ${saveError?.message || '알 수 없는 오류'}`);
      }

    } catch (error: any) {
      console.error('handleSaveNewBook 함수 오류:', error);
      let errorMessage = '이미지 저장 및 독서 기록 처리 중 알 수 없는 오류가 발생했습니다.';
      if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('처리 실패', errorMessage);
      // hide(); // 오류 발생 시 모달을 닫을지 여부는 정책에 따라 결정
    }
  };

  // 리뷰 추가 기능
  const handleSave = async () => {
    if (!book) return;

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.error('사용자 ID를 가져올 수 없습니다.');
        Alert.alert('오류', '사용자 정보를 확인하는데 실패했습니다. 다시 로그인 해주세요.');
        return;
      }
      const recordData = {
        user_id: userId,
        isbn: book.isbn,
        title: book.title,
        authors: book.authors,
        image_url: book.thumbnail || '',
        progress: Math.round(progress),
        rating: Math.round(rating),
        start_date: startDate ? startDate.toISOString().split('T')[0] : null,
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        review: reviewText,
      };
      const { success, error: saveError } = await saveReadingRecord(recordData);
      if (!success) {
        console.error('Supabase 저장 실패:', saveError);
        Alert.alert('저장 실패', `데이터 저장 중 오류가 발생했습니다: ${saveError?.message || '알 수 없는 오류'}`);
        return;
      }
      Alert.alert('저장 완료', '독서 기록이 성공적으로 저장되었습니다.');
      hide(); 
      navigation.reset({ 
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error: any) {
      console.error('handleSave 함수 오류:', error);
      Alert.alert('저장 실패', '알 수 없는 오류가 발생했습니다.');
    }
  };
  // 리뷰 수정 기능
  const handleUpdateReview = async () => {
    if (!selectedReview) return;
    const updatedData = {
      progress: Math.round(progress),
      rating: Math.round(rating),
      start_date: startDate ? startDate.toISOString().split('T')[0] : null,
      end_date: endDate ? endDate.toISOString().split('T')[0] : null,
      review: reviewText,
    };
    const { success, error } = await updateReview(selectedReview.id, updatedData);
    if (success) {
      fetchReviews();
      hide();
    } else {
      console.error('리뷰 업데이트 오류:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error ? String(error.message) : '알 수 없는 오류';
      Alert.alert('오류', `리뷰 업데이트 중 오류가 발생했습니다: ${errorMessage}`);
    }
  };

    // 리뷰 삭제 기능
    const handleDelete = async () => {
        if (!selectedReview) return;
        Alert.alert(
            "리뷰 삭제",
            "정말로 이 리뷰를 삭제하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    onPress: async () => {
                        const { success, error } = await deleteReview(selectedReview.id);
                        if (success) {
                            fetchReviews();
                            Alert.alert('성공', '리뷰가 삭제되었습니다.');
                            hide();
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

  // 이미지 선택 핸들러 (react-native-image-picker 사용)
  const pickImageHandler = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.5,
      includeBase64: false,
    };
    await launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
      } else if (response.assets && response.assets.length > 0) {
        const selectedAsset = response.assets[0];
        setImageUriInput(selectedAsset.uri);
        setSelectedImageObject(selectedAsset);
      }
    });
  };


  // !!!!! 모든 Hooks 호출 이후, JSX 반환 로직 이전에 조건부 렌더링 배치 !!!!!
  if (!isVisible) {
    return null;
  }

  if (modalType === 'modifyReview') {
    return (
        <Animated.View
        className="absolute flex-1 w-full h-full bg-black/50 items-center justify-center"
        style={{ opacity: fadeAnim }}
        pointerEvents={isVisible ? 'auto' : 'none'} 
      >
        <View className="w-11/12 h-auto bg-white rounded-xl p-6">
        {selectedReview && (
       <>
         {/* 책 정보 영역 */}
         <View className="flex-row items-start mb-4">
           {/* 책 썸네일 이미지 (ModalImageDisplay 사용) */}
           <View className="mr-4">
            <ModalImageDisplay 
              imageUrlOrPath={selectedReview.books?.image_url}
              style={{ width: 96, height: 144, borderRadius: 8 }} // w-24 h-36 rounded
            />
           </View>

           {/* 책 제목, 저자, ISBN */}
           <View className="flex-1">
             <Text className="text-lg font-bold mb-1" numberOfLines={2}>{selectedReview.books?.title || '제목 없음'}</Text>
             <Text className="text-sm text-gray-600 mb-2 font-p" numberOfLines={1}>{selectedReview.books?.author || '저자 정보 없음'}</Text>
             <Text className="text-xs text-gray-500 font-p">{`ISBN: ${selectedReview.isbn}`}</Text>
           </View>
         </View>

         {/* 진행도 */}
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

         {/* 평점 */}
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
             value={reviewText}
             onChangeText={setReviewText}
             textAlignVertical="top"
             maxLength={300}
           />
           <Text className="absolute bottom-0 right-1 text-xs text-gray-500 font-p">
             {reviewText.length}/300
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
               onPress={hide}
               type="info"
               className="w-auto" 
           />
                <DefaultButton
               title="저장하기"
               onPress={handleUpdateReview}
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
    );
  }
  if (modalType === 'addReview') {
    return (
        <Animated.View
        className="absolute flex-1 w-full h-full bg-black/50 items-center justify-center"
        style={{ opacity: fadeAnim }}
        pointerEvents={isVisible ? 'auto' : 'none'} 
      >
        <View className="w-11/12 h-auto bg-white rounded-xl p-6">
        {selectedBook && (
       <>
         {/* 책 정보 영역 */}
         <View className="flex-row items-start mb-4">
           {/* 책 썸네일 이미지 */}
           <View className="mr-4">
             {selectedBook.thumbnail ? (
               <Image
                 source={{ uri: selectedBook.thumbnail }}
                 className="w-24 h-36 rounded"
                 resizeMode="cover"
               />
             ) : (
               <View className="w-24 h-36 bg-gray-200 rounded justify-center items-center">
                  <Text className="text-gray-400 font-p">썸네일 없음</Text>
               </View>
             )}
           </View>

           {/* 책 제목, 저자, ISBN */}
           <View className="flex-1">
             <Text className="text-lg font-bold mb-1" numberOfLines={2}>{selectedBook.title || '제목 없음'}</Text>
             <Text className="text-sm text-gray-600 mb-2 font-p" numberOfLines={1}>{selectedBook.authors.join(', ') || '저자 정보 없음'}</Text>
             <Text className="text-xs text-gray-500 font-p">{`ISBN: ${selectedBook.isbn}`}</Text>
           </View>
         </View>

         {/* 진행도 */}
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

         {/* 평점 */}
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
             value={reviewText}
             onChangeText={setReviewText}
             textAlignVertical="top"
             maxLength={300}
           />
           <Text className="absolute bottom-0 right-1 text-xs text-gray-500 font-p">
             {reviewText.length}/300
           </Text>
         </View>

         {/* 버튼 영역 */}
         <View className="w-full flex-row justify-between items-center">
                <DefaultButton
               title="닫기"
               onPress={hide}
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
    );
  }

  if (modalType === 'addBook') {
    return (
        <Animated.View
        className="absolute flex-1 w-full h-full bg-black/50 items-center justify-center"
        style={{ opacity: fadeAnim }}
        pointerEvents={isVisible ? 'auto' : 'none'} 
      >
        <View className="w-11/12 h-auto bg-white rounded-xl p-6">
         {/* 책 정보 영역 */}
         <View className="flex-row items-start mb-4">
           {/* 책 썸네일 이미지 */}
           <View className="mr-4">
             <TouchableOpacity onPress={pickImageHandler} className="w-24 h-36 bg-gray-200 rounded justify-center items-center">
               {imageUriInput ? (
                 <Image source={{ uri: imageUriInput }} className="w-full h-full rounded" resizeMode="cover" />
               ) : (
                  <Text className="text-gray-400 font-p text-center">{`커버 이미지
선택`}</Text>
               )}
             </TouchableOpacity>
           </View>

           {/* 책 제목, 저자, ISBN */}
           <View className="flex-1 space-y-1">
             <TextInput
                className="border border-gray-300 rounded p-2 text-lg font-bold"
                placeholder="제목을 입력해 주세요"
                value={titleInput}
                onChangeText={setTitleInput}
                maxLength={100}
             />
             <TextInput
                className="border border-gray-300 rounded p-2 text-sm text-gray-600 font-p"
                placeholder="저자 정보를 입력해 주세요 (쉼표로 구분)"
                value={authorInput}
                onChangeText={setAuthorInput}
                maxLength={100}
             />
             <TextInput
                className="border border-gray-300 rounded p-2 text-xs text-gray-500 font-p"
                placeholder="ISBN 정보를 입력해 주세요"
                value={isbnInput}
                onChangeText={setIsbnInput}
                maxLength={20}
                keyboardType="numeric"
             />
           </View>
         </View>

         {/* 진행도 */}
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

         {/* 평점 */}
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
             value={reviewText}
             onChangeText={setReviewText}
             textAlignVertical="top"
             maxLength={300}
           />
           <Text className="absolute bottom-0 right-1 text-xs text-gray-500 font-p">
             {reviewText.length}/300
           </Text>
         </View>

         {/* 버튼 영역 */}
         <View className="w-full flex-row justify-between items-center">
                <DefaultButton
               title="닫기"
               onPress={hide}
               type="info"
               className="w-auto" 
           />
                <DefaultButton
               title="저장하기"
               onPress={handleSaveNewBook}
               className="w-auto"
           />
         </View>
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
    );
  }

  
  return null;
};

export default Modal;