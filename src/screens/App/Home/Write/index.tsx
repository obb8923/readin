import Background from "../../../../components/Background";
import { View, Text, TouchableOpacity, TextInput, Platform, ScrollView, Image, ActivityIndicator, Keyboard, Alert } from "react-native";
import { HomeStackParamList } from "../../../../nav/stack/Home";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState, useEffect } from "react";
import BookIcon from '../../../../../assets/svgs/Book.svg';
import Colors from '../../../../constants/Colors';
import { useAuthStore } from "../../../../store/authStore";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { searchBooks } from "../../../../libs/supabase/kakaoBookSearch";
import { supabase } from "../../../../libs/supabase/supabase";
import { getUserNickname } from "../../../../libs/supabase/supabaseOperations";

// 책 검색 결과 항목 타입 정의 (필요에 따라 확장)
interface BookSearchResult {
  title: string;
  authors: string[];
  thumbnail: string;
  isbn: string;
  // 필요한 다른 필드들 추가
}

const WriteScreen = ({navigation}: NativeStackScreenProps<HomeStackParamList, 'Write'>) => {
  const [content, setContent] = useState('');
  const [isSelectingBook, setIsSelectingBook] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [nickname, setNickname] = useState<string>('사용자');
  const [isNicknameLoading, setIsNicknameLoading] = useState(true);

  const user = useAuthStore((state) => state.user);
  // const userName = user?.user_metadata?.name || '사용자';

  useEffect(() => {
    const fetchNickname = async () => {
      setIsNicknameLoading(true);
      const fetchedNickname = await getUserNickname();
      if (fetchedNickname) {
        setNickname(fetchedNickname);
      }
      setIsNicknameLoading(false);
    };

    if (user) {
      fetchNickname();
    } else {
      setIsNicknameLoading(false); // 사용자가 없으면 로딩 종료
    }

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSelectBookPress = () => {
    setIsSelectingBook(true);
    setSelectedBook(null);
  };

  const handleBookSelect = (book: BookSearchResult) => {
    setSelectedBook(book);
    setIsSelectingBook(false);
    setBookTitle('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  // 책 검색 로직을 담당하는 함수
  const handleSearchBook = async () => {
    if (!bookTitle.trim()) {
      // 검색어가 없으면 아무것도 하지 않음 (또는 사용자에게 알림)
      return;
    }
    setIsLoading(true);
    setSearchResults([]); // 이전 검색 결과 초기화
    try {
      const response = await searchBooks(bookTitle);
      const books = response.documents.map((doc: any) => ({
        title: doc.title,
        authors: doc.authors,
        thumbnail: doc.thumbnail,
        isbn: doc.isbn,
      }));
      setSearchResults(books);
    } catch (error) {
      console.error("Book search failed:", error);
      // 사용자에게 오류 알림 표시 (예: Alert)
    } finally {
      setIsLoading(false);
    }
  };

  // 글 제출 로직을 담당하는 함수
  const handleSubmitPost = async () => {
    const userId = user?.id; // useAuthStore에서 가져온 user 객체 활용

    if (!userId) {
      Alert.alert("오류", "사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    if (!content.trim() && !selectedBook) {
      Alert.alert("알림", "글 내용을 작성하거나 책을 선택해주세요.");
      return;
    }

    setIsLoading(true); // 로딩 시작

    try {
      let bookIsbnToSave: string | null = null;

      // 1. 선택된 책이 있다면 books 테이블에 저장 (중복 확인 후)
      if (selectedBook) {
        bookIsbnToSave = selectedBook.isbn;

        const { data: existingBook, error: selectError } = await supabase
          .from('books')
          .select('isbn')
          .eq('isbn', selectedBook.isbn)
          .maybeSingle();

        if (selectError) {
          console.error('Books 테이블 조회 오류:', selectError);
          throw new Error('책 정보 확인 중 오류가 발생했습니다.');
        }

        if (!existingBook) {
          console.log(`Books 테이블에 새 책 추가: ${selectedBook.isbn}`);
          const bookDataToInsert = {
            isbn: selectedBook.isbn,
            title: selectedBook.title,
            author: selectedBook.authors.join(','), // 저자 배열을 문자열로
            image_url: selectedBook.thumbnail, 
          };
          const { error: insertBookError } = await supabase
            .from('books')
            .insert([bookDataToInsert]);

          if (insertBookError) {
            console.error('Books 테이블 삽입 오류:', insertBookError);
            throw new Error('책 정보 저장 중 오류가 발생했습니다.');
          }
          console.log(`Books 테이블 삽입 성공: ${selectedBook.isbn}`);
        } else {
          console.log(`Books 테이블에 책 이미 존재: ${selectedBook.isbn}`);
        }
      }

      // 2. posts 테이블에 글 정보 저장
      console.log('Posts 테이블에 글 정보 추가 시도');
      const postDataToInsert = {
        content: content.trim() || null, // 내용이 없으면 null
        user_id: userId,
        isbn: bookIsbnToSave, // 선택된 책의 isbn 또는 null
      };

      const { error: insertPostError } = await supabase
        .from('posts') // 테이블 이름을 'posts'로 가정합니다.
        .insert([postDataToInsert]);

      if (insertPostError) {
        console.error('Posts 테이블 삽입 오류:', insertPostError);
        throw new Error('글 저장 중 오류가 발생했습니다.');
      }

      console.log('Posts 테이블 삽입 성공');
      Alert.alert("성공", "글이 성공적으로 등록되었습니다.");

      // 성공 시 입력 필드 초기화
      setContent('');
      setBookTitle('');
      setSelectedBook(null);
      setSearchResults([]);
      setIsSelectingBook(false); // 제출 모드로 전환

      navigation.goBack(); // 성공 후 뒤로가기

    } catch (error: any) {
      console.error('handleSubmitPost 함수 오류:', error);
      Alert.alert("오류", error.message || "글 등록 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  const handleWriteSubmit = async () => {
    Keyboard.dismiss(); // 버튼 클릭 시 키보드 내림
    if (isSelectingBook) await handleSearchBook(); // 책 검색 함수 호출
    else await handleSubmitPost(); // 글 제출 함수 호출
  }

  return (
    <Background>
        <View className="flex-1">
          <KeyboardAwareScrollView
            className="flex-1 "
            resetScrollToCoords={{ x: 0, y: 0 }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={Platform.OS === 'ios' ? 20 : -6}
            enableOnAndroid={true}
          >
            {/* 글쓰기 영역 */}
            <View className="px-4">
              {/* 사용자 이름 표시 */}
              <Text className="text-lg text-gray-800 my-2 font-p">{isNicknameLoading ? '로딩 중...' : `${nickname}님의 글쓰기`}</Text>
              {/* 여기 아래에 글을 쓸 수 있는 텍스트 인풋 */}
              <TextInput
                className="w-full h-[200px] bg-white border-l-4 border-gray-300 rounded-r-lg p-4 text-base leading-6 font-p"
                placeholder="생각을 자유롭게 작성해주세요."
                placeholderTextColor="#9ca3af" // gray-400
                multiline={true}
                value={content}
                onChangeText={setContent}
                textAlignVertical="top" // 안드로이드에서 placeholder 정렬을 위함
                onFocus={() => setIsSelectingBook(false)} // 본문 입력창 포커스 시 '제출' 모드로
              />
              {isSelectingBook ? (
                <TextInput
                  className="w-full bg-white border-l-4 border-skyblue rounded-r-lg p-4 text-base leading-6 font-p mt-4"
                  placeholder="책 제목을 입력하세요"
                  placeholderTextColor="#9ca3af" // gray-400
                  value={bookTitle}
                  onChangeText={setBookTitle}
                  autoFocus={true}
                  onFocus={() => setIsSelectingBook(true)} // 책 검색창 포커스 시 '검색' 모드로
                />
              ) : selectedBook ? (
                // 선택된 책 정보 표시
                <View className="flex-row items-center justify-start mt-4 p-4 bg-white border-l-4 border-skyblue rounded-r-lg">
                  {selectedBook.thumbnail ? (
                    <Image source={{ uri: selectedBook.thumbnail }} className="w-10 h-16 mr-3 rounded" resizeMode="cover"/>
                  ) : (
                    <BookIcon style={{ color: Colors.svggray, marginRight: 12, width: 24, height: 24 }} /> // 아이콘 크기 조정
                  )}
                  <View className="flex-1">
                    <Text className="text-gray-800 font-p-semibold text-base" numberOfLines={2}>{selectedBook.title}</Text>
                    {selectedBook.authors && selectedBook.authors.length > 0 && (
                        <Text className="text-gray-500 font-p text-sm">{selectedBook.authors.join(', ')}</Text>
                    )}
                  </View>
                  {/* 책 선택 취소 또는 변경 버튼 (선택 사항) */}
                  <TouchableOpacity onPress={() => { setSelectedBook(null); setIsSelectingBook(true); /* setBookTitle(''); setSearchResults([]); */ }} className="ml-2 p-1">
                      <Text className="text-red-500 font-p-semibold">변경</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  className="flex-row items-center justify-start mt-4"
                  onPress={handleSelectBookPress}
                >
                  <BookIcon style={{ color: Colors.svggray, marginRight: 8 }} />
                  <Text className="text-gray-500 font-p-semibold text-lg">책 선택하기</Text>
                </TouchableOpacity>
              )}

              {/* 책 검색 결과 표시 */}
              {isSelectingBook && isLoading && (
                <View className="h-32 items-center justify-center">
                  <ActivityIndicator size="large" color={Colors.skyblue} />
                </View>
              )}
              {/* 키보드가 활성화되어 있지 않을 때만 검색 결과 표시 */}
              {isSelectingBook && !isLoading && searchResults.length > 0 && !isKeyboardVisible && (
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="mt-4 h-auto self-start"> 
                  {searchResults.map((book, index) => (
                    <TouchableOpacity 
                      key={index} 
                      className="w-20 justify-start items-start bg-white rounded-lg p-3 mr-3 shadow" // 각 항목 스타일링
                      onPress={() => handleBookSelect(book)} // 4단계에서 정의할 함수
                    >
                      {book.thumbnail ? (
                        <Image source={{ uri: book.thumbnail }} className="w-16 h-24 rounded-md mb-2" resizeMode="cover" />
                      ) : (
                        // 대체 이미지 또는 아이콘
                        <View className="w-16 h-24 rounded-md mb-2 bg-gray-200 items-center justify-center">
                        </View>
                      )}
                        <Text className="text-sm font-p-semibold text-gray-800" numberOfLines={1}>{book.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              {/* 키보드가 활성화되어 있지 않을 때만 검색 결과 없음 메시지 표시 */}
               {isSelectingBook && !isLoading && searchResults.length === 0 && bookTitle.length > 0 && !isKeyboardVisible && (
                <View className="h-32 items-center justify-center">
                  <Text className="text-gray-500 font-p">검색 결과가 없습니다.</Text>
                </View>
              )}
            </View>

            {/* submit 버튼 영역을 KeyboardAwareScrollView 내부로 이동 */}
            <View className="w-full h-20 bg-background pb-6 mt-4 z-10">
              <View className="w-full h-full flex-row items-center justify-between px-6">
                <Text className="text-gray-500 font-p">{content.length}/1000</Text>
                <TouchableOpacity
                  className=" bg-skyblue rounded-full px-4 py-2"
                  onPress={handleWriteSubmit}
                >
                  <Text className="text-background font-p">{isSelectingBook ? '검색' : '제출'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
    </Background>
  );
};
export default WriteScreen;