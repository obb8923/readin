import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@component/Text';
import { BookVertical } from '@/shared/component/BookVertical';
import { BookData } from '@home/component/TowerOfBooks';

export const BookShelf = ({books = []}: {books: BookData[]}) => {
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
            <BookVertical
              key={book.id}
              id={book.id}
              title={book.title}
              thickness={book.thickness}
              height={book.height}
              color={book.color}
            />
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
    </View>
  );
};
