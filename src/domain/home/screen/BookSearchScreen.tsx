import { View, FlatList, ActivityIndicator, Alert, Image, Modal, TouchableOpacity, TextInput, Platform, LayoutChangeEvent, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Text } from "@component/Text";
import { Background } from "@/shared/component/Background";
import { AppBar } from "@/shared/component/AppBar";
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "@nav/stack/Home";
import { type NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchBar } from "@/shared/component/SearchBar";
import { useState } from "react";
import DateTimePicker from '@react-native-community/datetimepicker';
import { searchBooks } from "@/shared/libs/supabase/bookSearch";
import { BookType } from "@/shared/type/bookType";
import {Colors} from "@constant/Colors";
import { useShowTabBar } from '@/shared/store/tabStore';
import { fetchPhysicalInfoWithPerplexity } from '@/shared/libs/supabase/enrichBook';
import RNHorizontalSlider from "@/shared/component/Slider";
export const BookSearchScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const MEMO_MAX = 200;
  const [searchResults, setSearchResults] = useState<BookType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEnrichLoading, setIsEnrichLoading] = useState(false);
  const [enriched, setEnriched] = useState<{ width: number; height: number; thickness: number; pages: number; weight: number } | null>(null);
  const [rating, setRating] = useState(100);
  const [memo, setMemo] = useState('');
  const [memoDraft, setMemoDraft] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showMemoEditor, setShowMemoEditor] = useState(false);
  const [ratingWidth, setRatingWidth] = useState(0);
  const showTabBar = useShowTabBar();
  // 검색 실행 함수
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchBooks(query);
      setSearchResults(results);
      console.log("results: ",results);
    } catch (error) {
      console.error('검색 오류:', error);
      Alert.alert('검색 오류', '책을 검색하는 중 오류가 발생했습니다. 다시 시도해주세요.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색어 변경 처리 (검색은 하지 않음)
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  // 검색 제출 처리
  const handleSearchSubmit = () => {
    handleSearch(searchQuery);
  };

  // 검색 결과 렌더링
  const handleOpenModal = (book: BookType) => {
    setSelectedBook(book);
    setIsModalVisible(true);
    setEnriched(null);
    setRating(100);
    setMemo('');
    setMemoDraft('');
    setStartDate(new Date());
    setEndDate(new Date());
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowMemoEditor(false);
    // Perplexity로 보강 정보 조회
    setIsEnrichLoading(true);
    fetchPhysicalInfoWithPerplexity({
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
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBook(null);
    setRating(0);
    setMemo('');
    setMemoDraft('');
    setStartDate(null);
    setEndDate(null);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowMemoEditor(false);
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

  const renderBookItem = ({ item }: { item: BookType }) => (
    <TouchableOpacity onPress={() => handleOpenModal(item)} activeOpacity={0.8} className="mb-4 flex-row items-center rounded-lg p-4 bg-gray800">
      {/* 왼쪽 이미지 */}
      <View className="mr-4">
        <View 
          className="bg-gray-200 rounded-md items-center justify-center"
          style={{ width: 80, height: 100 }}
        >
          {item.imageUrl && (
            <Image 
              source={{ uri: item.imageUrl }} 
              className="w-full h-full rounded-md"
              resizeMode="cover"
            />
          ) }
        </View>
      </View>
      
      {/* 오른쪽 텍스트 정보 */}
      <View className="flex-1">
        <Text 
          text={item.title} 
          type="title4" 
          className="text-white mb-1" 
          numberOfLines={2}
        />
        <Text 
          text={item.author.join(', ')} 
          type="body3" 
          className="text-gray200 mb-1" 
          numberOfLines={1}
        />
        <Text 
          text={item.publisher} 
          type="caption1" 
          className="text-gray300" 
          numberOfLines={1}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <Background>
        <AppBar 
        title="책 검색" 
        onLeftPress={() => {
          showTabBar();
          navigation.goBack();
        }}
        />
        <View className="p-4">
            <SearchBar 
              autoFocus={true} 
              value={searchQuery}
              onChangeText={handleSearchQueryChange}
              onSubmitEditing={handleSearchSubmit}
            />
        </View>
        
        {/* 검색 결과 */}
        <View className="flex-1 px-4">
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text text="검색 중..." className="mt-2 text-gray-600" />
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderBookItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )  : (
            <View className="flex-1 justify-center items-center">
              <Text 
                text="책 제목, 저자, 또는 키워드를 입력해주세요."
                className="text-gray-500 text-center" 
              />
            </View>
          )}
        </View>
        {/* 저장 모달 */}
        <Modal
          animationType="fade"
          transparent
          visible={isModalVisible}
          onRequestClose={handleCloseModal}
        >
          {/* 모달 배경 */}
          <View className="flex-1 justify-center items-center bg-black/80">
          {/* 모달 전체 컨테이너 */}
            <View className="bg-gray800 rounded-2xl p-6 mx-4 w-11/12 border border-primary">
              {selectedBook && (
                <View>
                  
                  {/* 책 정보 섹션 */}
                  <View className="flex-row mb-6">
                    {/* 왼쪽 이미지 */}
                    <View className="mr-4">
                      <View 
                        className="bg-gray-200 rounded-md items-center justify-center"
                        style={{ width: 80, height: 100 }}
                      >
                        {selectedBook.imageUrl && (
                          <Image 
                            source={{ uri: selectedBook.imageUrl }} 
                            className="w-full h-full rounded-md"
                            resizeMode="cover"
                          />
                        )}
                      </View>
                    </View>
                    
                    {/* 오른쪽 책 정보 */}
                    <View className="flex-1">
                      <Text 
                        text={selectedBook.title} 
                        type="body1" 
                        className="text-white mb-2" 
                        numberOfLines={2}
                      />
                      <Text 
                        text={selectedBook.author.join(', ')} 
                        type="body3" 
                        className="text-gray300 mb-1" 
                        numberOfLines={1}
                      />
                      <Text 
                        text={selectedBook.publisher} 
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
                    <TouchableOpacity onPress={handleCloseModal} className="flex-1 mr-2 bg-gray700 rounded-xl py-3 items-center" activeOpacity={0.8}>
                      <Text text="취소" type="body2" className="text-white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { /* 저장 콜백 연결 예정: selectedBook + enriched + rating + memo + startDate + endDate */ handleCloseModal(); }} className="flex-1 ml-2 bg-primary rounded-xl py-3 items-center" activeOpacity={0.8}>
                      <Text text="저장" type="body2" className="text-white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
    </Background>
  );
};