import React, { useState, useEffect } from 'react';
import { 
    View, Text, TextInput, ActivityIndicator, FlatList, 
    Alert, Image, TouchableOpacity, 
} from 'react-native';
import { searchBooks } from '../../../../libs/supabase/kakaoBookSearch';
import { BookcaseStackParamList } from '../../../../nav/stack/Bookcase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Background from '../../../../components/Background';
import useSnackBar from '../../../../libs/hooks/useSnackBar';
import { useModalStore } from '../../../../store/modalStore';
import { Book } from '../../../../libs/supabase/supabaseOperations';

type BookSearchScreenProps = NativeStackScreenProps<BookcaseStackParamList, 'BookSearch'>;
const BookSearchScreen=({navigation}: BookSearchScreenProps) => {
  const { show: showSnackBar, hide: hideSnackBar } = useSnackBar();
  const { show, hide, isVisible: isModalVisible } = useModalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
 
  //이 화면에서 탭바 숨기기 및 정리 작업
  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      hideSnackBar(); // 스낵바 숨기기
      hide(); // 모달 숨기기
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });
    };
  }, [navigation, hideSnackBar, hide]); // 의존성 배열 업데이트

  // 검색하면 스낵바 띄우기
  useEffect(() => {
    if (searchResults.length > 0 && !isModalVisible) {
      showSnackBar('찾는 책이 없나요?', '추가하기', () => {
        hideSnackBar();
        show('addBook',null,null);
      });
    }
    if (isModalVisible) hideSnackBar();
  }, [searchResults,isModalVisible]);
  
  // 검색 실행 함수
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
      <View className="flex-1 rounded-lg px-4 pt-4">
        {isSearching ? (
          <ActivityIndicator size="large" className="mt-5" />
        ) : searchError ? (
          <Text className="text-red-500 text-center mt-5 font-p">{searchError}</Text>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => `${item.isbn || item.title}-${index}`}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => show('addReview',null,item)}>
                <View className="bg-white flex-row mb-4 p-4 border-b border-gray-200 items-center">
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
  
    </Background>
  );
} 

export default BookSearchScreen;