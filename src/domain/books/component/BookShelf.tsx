import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@component/Text';
import { BookVertical } from '@/shared/component/BookVertical';
import { BookType, BookWithRecord } from '@/shared/type/bookType';
import { BookRecordModal } from '@/shared/component/BookRecordModal';

export const BookShelf = ({books = []}: {books: BookWithRecord[]}) => {
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
        {/* 책들을 flexRow와 flexWrap으로 배치 */}
        <View 
        className="flex-row flex-wrap gap-2 items-end gap-y-8">
          {books.map((book) => (
            <TouchableOpacity
              key={book.id}
              onPress={() => handleBookPress(book)}
              activeOpacity={0.8}
            >
              <BookVertical
                id={book.id}
                title={book.title}
                pages={book.pages}
                height={book.height}
                color={undefined}
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
