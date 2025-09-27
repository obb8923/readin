import React, { useState, useEffect } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  Platform, 
  Alert,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';
import { Text } from '@component/Text';
import { BookType } from '@/shared/type/bookType';
import { Colors } from '@constant/Colors';
import { BookImage } from '@component/BookImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@component/Button';
import { searchBooks } from '@libs/supabase/bookSearch';
import { saveBookAndLog, save2BookAndLog } from '@libs/supabase/saveBookAndReadingLog';
import { fetchPhysicalInfoWithPerplexity } from '@libs/supabase/enrichBook';
import { DEFAULT_THICKNESS, DEFAULT_HEIGHT, DEFAULT_WIDTH, DEFAULT_WEIGHT, DEFAULT_PAGES } from '@constant/defaultBook';

interface BookSearchResult {
  title: string;
  found: boolean;
  book?: BookType;
  error?: string;
  isProcessing?: boolean;
  physicalInfo?: {
    width: number;
    height: number;
    thickness: number;
    pages: number;
    weight: number;
    kdc?: string;
  };
}

interface BulkAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveSuccess?: (savedBooks: any[]) => void;
}

export const BulkAddModal = ({
  visible,
  onClose,
  onSaveSuccess,
}: BulkAddModalProps) => {
  const [titlesInput, setTitlesInput] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<'input' | 'preview' | 'saving'>('input');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const insets = useSafeAreaInsets();

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (visible) {
      setTitlesInput('');
      setSearchResults([]);
      setIsSearching(false);
      setIsSaving(false);
      setCurrentStep('input');
      setProgress({ current: 0, total: 0 });
    }
  }, [visible]);

  const handleCloseModal = () => {
    Keyboard.dismiss(); // 키보드 닫기
    onClose();
    setTitlesInput('');
    setSearchResults([]);
    setIsSearching(false);
    setIsSaving(false);
    setCurrentStep('input');
    setProgress({ current: 0, total: 0 });
  };

  // 입력된 제목들을 파싱
  const parseTitles = (input: string): string[] => {
    return input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  // 여러 책 검색
  const handleSearch = async () => {
    const titles = parseTitles(titlesInput);
    if (titles.length === 0) {
      Alert.alert('입력 오류', '책 제목을 입력해주세요.');
      return;
    }

    setIsSearching(true);
    setCurrentStep('preview');
    setProgress({ current: 0, total: titles.length });

    const results: BookSearchResult[] = [];

    // 각 제목에 대해 병렬로 검색
    const searchPromises = titles.map(async (title, index) => {
      try {
        const books = await searchBooks(title);
        const found = books.length > 0;
        
        let physicalInfo = undefined;
        if (found && books[0]) {
          try {
            // Perplexity API로 물리 정보 조회
            physicalInfo = await fetchPhysicalInfoWithPerplexity({
              title: books[0].title,
              authors: books[0].author,
              publisher: books[0].publisher,
              isbn: books[0].isbn,
            });
          } catch (physicalError) {
            console.warn(`물리 정보 조회 실패 (${title}):`, physicalError);
            // 물리 정보 조회 실패해도 책은 저장 가능
          }
        }
        
        const result: BookSearchResult = {
          title,
          found,
          book: found ? books[0] : undefined,
          physicalInfo,
          error: undefined,
        };

        setProgress({ current: index + 1, total: titles.length });
        return result;
      } catch (error) {
        const result: BookSearchResult = {
          title,
          found: false,
          error: error instanceof Error ? error.message : '검색 오류',
        };

        setProgress({ current: index + 1, total: titles.length });
        return result;
      }
    });

    try {
      const searchResults = await Promise.all(searchPromises);
      setSearchResults(searchResults);
    } catch (error) {
      console.error('검색 오류:', error);
      Alert.alert('검색 오류', '책을 검색하는 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 검색 결과에서 항목 제거
  const removeResult = (index: number) => {
    const newResults = searchResults.filter((_, i) => i !== index);
    setSearchResults(newResults);
  };

  // 여러 책 저장
  const handleSave = async () => {
    if (searchResults.length === 0) return;

    setIsSaving(true);
    setCurrentStep('saving');
    setProgress({ current: 0, total: searchResults.length });

    const savedBooks: any[] = [];
    const errors: string[] = [];

    // 각 결과에 대해 저장
    for (let i = 0; i < searchResults.length; i++) {
      const result = searchResults[i];
      setProgress({ current: i + 1, total: searchResults.length });

      try {
        if (result.found && result.book) {
          // 검색된 책 저장 (물리 정보 포함)
          const saved = await saveBookAndLog({
            book: result.book,
            physical: result.physicalInfo,
            kdc: result.physicalInfo?.kdc,
            rate: 100, // 기본 평점
            memo: '',
            startedAt: new Date(),
            finishedAt: new Date(),
          });
          savedBooks.push(saved);
        } else {
          // 직접 등록
          const saved = await save2BookAndLog({
            title: result.title,
            author: '',
            publisher: '',
            physical: {
              width: DEFAULT_WIDTH,
              height: DEFAULT_HEIGHT,
              thickness: DEFAULT_THICKNESS,
              weight: DEFAULT_WEIGHT,
              pages: DEFAULT_PAGES,
            },
            rate: 100,
            memo: '',
            startedAt: new Date(),
            finishedAt: new Date(),
          });
          savedBooks.push(saved);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '저장 오류';
        errors.push(`${result.title}: ${errorMsg}`);
      }
    }

    setIsSaving(false);

    if (savedBooks.length > 0) {
      Alert.alert(
        '저장 완료', 
        `${savedBooks.length}권의 책이 추가되었습니다.${errors.length > 0 ? `\n\n저장 실패: ${errors.length}권` : ''}`,
        [
          {
            text: '확인',
            onPress: () => {
              handleCloseModal();
              onSaveSuccess?.(savedBooks);
            }
          }
        ]
      );
    } else {
      Alert.alert('저장 실패', '책을 저장하는 중 오류가 발생했습니다.');
    }
  };

  const renderSearchResult = ({ item, index }: { item: BookSearchResult; index: number }) => (
    <View className="flex-row items-center p-3 bg-gray700 rounded-lg mb-2">
      <BookImage 
        imageUrl={item.book?.imageUrl || ''} 
        className="w-12 h-16 mr-3" 
      />
      <View className="flex-1">
        <Text 
          text={item.title} 
          type="body3" 
          className="text-white mb-1" 
          numberOfLines={1}
        />
        {item.found && item.book ? (
          <>
            <Text 
              text={item.book.author?.join(', ') || ''} 
              type="caption1" 
              className="text-gray300 mb-1" 
              numberOfLines={1}
            />
            <Text 
              text={item.book.publisher || ''} 
              type="caption1" 
              className="text-gray400" 
              numberOfLines={1}
            />
          </>
        ) : (
          <Text 
            text="직접 등록됨" 
            type="caption1" 
            className="text-orange-400" 
          />
        )}
      </View>
      <TouchableOpacity
        onPress={() => removeResult(index)}
        className="p-2"
        activeOpacity={0.7}
      >
        <Text text="삭제" type="caption1" className="text-red-400" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleCloseModal}
    >
      <View className="flex-1 bg-black/80" style={{ paddingTop: insets.top }}>
        <View className="flex-1"/>
        {/* 모달 전체 컨테이너 */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
          className="bg-gray800 rounded-t-2xl"
          style={{paddingBottom: insets.bottom + 24, maxHeight: '95%' }}
        >
          <ScrollView 
            className="px-6 pt-8"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{paddingBottom: insets.bottom }}
          >
            {/* 헤더 */}
            <View className="flex-row justify-between items-center mb-6">
              <Text text="한번에 추가하기" type="title2" className="text-white" />
              <TouchableOpacity
                onPress={handleCloseModal}
                className="p-2"
                activeOpacity={0.7}
              >
                <Text text="닫기" type="body3" className="text-gray300" />
              </TouchableOpacity>
            </View>

            {currentStep === 'input' && (
              <>
                {/* 입력 섹션 */}
                <View className="mb-6">
                  <Text text="한 줄에 하나씩 책 제목들을 입력해주세요" type="body2" className="text-white mb-3" />
                  <TextInput
                    value={titlesInput}
                    autoFocus
                    onChangeText={setTitlesInput}
                    placeholder="예시:&#10;해리포터와 마법사의 돌&#10;반지의 제왕&#10;1984"
                    placeholderTextColor={Colors.gray400}
                    multiline
                    numberOfLines={8}
                    className="bg-gray700 rounded-lg p-4 text-white text-md"
                    style={{ textAlignVertical: 'top', minHeight: 200 }}
                  />
                </View>

                {/* 버튼 */}
                <View className="flex-row">
                  <Button 
                    text="취소"
                    onPress={() => {
                      Keyboard.dismiss(); // 키보드 닫기
                      handleCloseModal();
                    }} 
                    className="bg-gray700"
                  />
                  <Button
                    text="검색하기"
                    onPress={handleSearch}
                    className="ml-4 bg-primary"
                    disabled={!titlesInput.trim()}
                  />
                </View>
              </>
            )}

            {currentStep === 'preview' && (
              <>
                {/* 진행 상황 */}
                {isSearching && (
                  <View className="mb-6 p-4 bg-gray700 rounded-lg">
                    <Text 
                      text={`검색 중... (${progress.current}/${progress.total})`} 
                      type="body3" 
                      className="text-white mb-2" 
                    />
                    <View className="w-full bg-gray600 rounded-full h-2">
                      <View 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      />
                    </View>
                  </View>
                )}

                {/* 검색 결과 */}
                <View className="mb-6">
                  <Text 
                    text={`검색 결과 (${searchResults.length}권)`} 
                    type="body2" 
                    className="text-white mb-3" 
                  />
                  
                  {searchResults.length > 0 ? (
                    <>
                    <FlatList
                      data={searchResults}
                      renderItem={renderSearchResult}
                      keyExtractor={(_, index) => index.toString()}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={false}
                    />
                    <Text text="세부사항은 나중에 수정할 수 있습니다." type="caption1" className="text-gray300 mb-3" />
                    </>
                  ) : !isSearching && (
                    <View className="p-4 bg-gray700 rounded-lg">
                      <Text text="검색 결과가 없습니다." type="body3" className="text-gray400 text-center" />
                    </View>
                  )}
                </View>

                {/* 버튼 */}
                <View className="flex-row">
                  <Button 
                    text="다시 검색"
                    onPress={() => {
                      Keyboard.dismiss(); // 키보드 닫기
                      setCurrentStep('input');
                    }} 
                    className="bg-gray700"
                  />
                  <Button
                    text="저장하기"
                    onPress={handleSave}
                    className="ml-4 bg-primary"
                    disabled={searchResults.length === 0 || isSearching}
                  />
                </View>
              </>
            )}

            {currentStep === 'saving' && (
              <>
                {/* 저장 진행 상황 */}
                <View className="mb-6 p-4 bg-gray700 rounded-lg">
                  <Text 
                    text={`저장 중... (${progress.current}/${progress.total})`} 
                    type="body3" 
                    className="text-white mb-2" 
                  />
                  <View className="w-full bg-gray600 rounded-full h-2">
                    <View 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(progress.current /progress.total) * 100}%` }}
                    />
                  </View>
                </View>

                <View className="p-4 bg-gray700 rounded-lg">
                  <Text 
                    text="책들을 저장하고 있습니다. 잠시만 기다려주세요." 
                    type="body3" 
                    className="text-gray300 text-center" 
                  />
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
