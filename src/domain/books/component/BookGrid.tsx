import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@component/Text';
import { BookHorizontal } from '@/shared/component/BookHorizontal';
import { BookData } from '@home/component/TowerOfBooks';

export const BookGrid = ({ books = [] }: { books: BookData[] }) => {
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
            <View key={book.id} className="w-[31%] mb-6">
              {/* 책 표지 이미지 영역 (3:4 비율) */}
              <View className="w-full aspect-[3/4] bg-gray-700 rounded-lg mb-2 overflow-hidden">
                {/* 임시로 BookHorizontal 컴포넌트 사용, 나중에 이미지로 교체 */}
                <View className="flex-1 justify-center items-center">
                  <BookHorizontal
                    id={book.id}
                    title={book.title}
                    thickness={book.thickness}
                    height={book.height}
                    color={book.color}
                  />
                </View>
              </View>
              
              {/* 책 제목 */}
              <Text 
                text={book.title}
                className="text-white text-xs text-center"
                numberOfLines={2}
              />
            </View>
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
