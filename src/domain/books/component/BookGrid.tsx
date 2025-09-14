import React, { useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text } from '@component/Text';
import { BookType, BookWithRecord } from '@/shared/type/bookType';
import { BookRecordModal } from '@/shared/component/BookRecordModal';

export const BookGrid = ({ books = [] }: { books: BookWithRecord[] }) => {
  const [selectedBook, setSelectedBook] = useState<BookWithRecord | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleBookPress = (book: BookWithRecord) => {
    setSelectedBook(book);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBook(null);
  };

  return (
    <View className="flex-1">
      {/* 책장 정보 */}
      <View className="px-4 py-2 mb-2">
        <Text 
          text={`총 ${books.length}권`}
          className="text-gray-400 text-sm"
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={true}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        {/* 그리드 형태로 책들을 3열로 배치 - 책 표지 비율 고려 */}
        <View className="flex-row flex-wrap gap-2 justify-between">
          {books.map((book) => (
            <TouchableOpacity 
              key={book.id} 
              className="w-[31%] mb-6"
              onPress={() => handleBookPress(book)}
              activeOpacity={0.8}
            >
              {/* 책 표지 이미지 영역 (2:3 비율 - 일반적인 책 비율) */}
              <View className="w-full aspect-[2/3] bg-gray-700 rounded-lg mb-2 overflow-hidden">
                {book.imageUrl ? (
                  <Image
                    source={{ uri: book.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-gray-600 flex items-center justify-center">
                  </View>
                )}
              </View>
              
              {/* 책 제목 */}
              <Text 
                text={book.title}
                className="text-white text-xs text-center"
                numberOfLines={2}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* 빈 책장일 때 */}
        {books.length === 0 && (
          <View className="flex-1 justify-center items-center py-20">
            <Text 
              text="아직 책이 없습니다"
              className="text-gray-500 text-lg"
            />
            <Text 
              text="첫 번째 책을 추가해보세요"
              className="text-gray-600 text-sm mt-2"
            />
          </View>
        )}
      </ScrollView>

      {/* 책 기록 모달 */}
      <BookRecordModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        book={selectedBook}
      />
    </View>
  );
};
