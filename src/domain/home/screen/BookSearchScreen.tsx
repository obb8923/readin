import { View, FlatList, ActivityIndicator, Alert, Image, TouchableOpacity } from "react-native";
import { Text } from "@component/Text";
import { Background } from "@/shared/component/Background";
import { AppBar } from "@/shared/component/AppBar";
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "@nav/stack/Home";
import { type NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchBar } from "@/shared/component/SearchBar";
import { useState } from "react";
import { searchBooks } from "@/shared/libs/supabase/bookSearch";
import { BookType } from "@/shared/type/bookType";
import {Colors} from "@constant/Colors";
import { useShowTabBar } from '@/shared/store/tabStore';
import { BookImage } from "@/shared/component/BookImage";
import { BookRecordModal } from "@/shared/component/BookRecordModal";
export const BookSearchScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [searchResults, setSearchResults] = useState<BookType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
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
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBook(null);
  };

  const handleSaveSuccess = (saved: any) => {
    // saveBookAndLog에서 이미 store에 추가되었으므로 별도 처리 불필요
    showTabBar();
    navigation.goBack();
  };


  const renderBookItem = ({ item }: { item: BookType }) => (
    <TouchableOpacity 
    onPress={() => handleOpenModal(item)} 
    activeOpacity={0.8} 
    className="mb-4 flex-row items-center rounded-lg p-4 py-2 bg-gray800 h-28">
      {/* 왼쪽 이미지 */}

      <BookImage imageUrl={item.imageUrl} className="mr-4" />
      
      {/* 오른쪽 텍스트 정보 */}
      <View className="flex-1 items-start justify-center">
        <Text 
          text={item.title} 
          type="title4" 
          className="text-white mb-1" 
          numberOfLines={1}
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
        <BookRecordModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          book={selectedBook}
          mode="save"
          onSaveSuccess={handleSaveSuccess}
        />
    </Background>
  );
};