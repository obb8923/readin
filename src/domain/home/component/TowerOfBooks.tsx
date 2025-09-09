import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/shared/component/Text';
import { Book } from '@home/component/Book';
import { Colors } from '@/shared/constant/Colors';
import { defaultBooks } from '@/shared/constant/mock';
export interface BookData {
  id: string;
  title: string;
  thickness: number;
  height: number; // 페이지수 (총 높이 계산용)
  color?: string;
}

interface TowerOfBooksProps {
  books?: BookData[];
}



export const TowerOfBooks: React.FC<TowerOfBooksProps> = ({ 
  books = defaultBooks 
}) => {
  // 총 페이지수 계산
  const totalPages = books.reduce((sum, book) => sum + book.height, 0);
  
  // 총 높이 계산 (1페이지 = 2픽셀)
  const totalHeight = totalPages * 2;
  
  return (
    <View className="flex-1">
      {/* 총 높이 정보 표시 */}
      <View className="mb-4 p-3 rounded-lg border border-gray-700">
        <Text 
          text={`총 ${books.length}권의 책 • ${totalPages}페이지 • 높이 ${totalHeight}mm`}
          className="text-gray-300 text-xs mt-1"
        />
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={true}
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 16,
          minHeight: '100%',
        }}
      >
          {books.map((book, index) => (
              <Book
                id={book.id}
                title={book.title}
                thickness={book.thickness}
                height={book.height}
                color={book.color}
                key={book.id}
              />
          ))}
      </ScrollView>
    </View>
  );
};
