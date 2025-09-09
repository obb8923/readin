import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/shared/component/Text';
import { BookHorizontal } from '@/shared/component/BookHorizontal';
import { defaultBooks } from '@/shared/constant/mock';
import { DEVICE_WIDTH } from '@/shared/constant/normal';
import { BookType } from '@/shared/type/bookType';
import {Colors} from '@constant/Colors';

interface TowerOfBooksProps {
  books?: BookType[];
}

export const TowerOfBooks = ({ 
  books = defaultBooks 
}: TowerOfBooksProps) => {

  // 총 페이지수 계산
  const totalPages = books.reduce((sum, book) => sum + book.pages, 0);
  
  // 총 높이 계산 (실제 책 높이의 합)
  const totalHeight = books.reduce((sum, book) => sum + book.height, 0);
  
  // 가장 높은 책의 높이 찾기
  const maxHeight = Math.max(...books.map(book => book.height));
  
  // 가장 높은 책을 DEVICE_WIDTH/2로 설정하는 비례 상수 계산
  const scaleFactor = (DEVICE_WIDTH * 7 / 12) / maxHeight;
  
  return (
    <View className="flex-1">
    
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 16,
          minHeight: '100%',
          borderBottomWidth: 1,
          borderBottomColor: Colors.primary,
        }}
      >
          {/* 총 높이 정보 표시 */}
      <View className="mb-4 p-3 rounded-lg">
        <Text 
          text={`${books.length}권의 책 \n ${totalPages} 페이지 \n 높이 ${totalHeight}cm`}
          className="text-gray-300 text-xs mt-1 text-center"
        />
        <View className="flex-row">
        <Text text="머그컵" type="body1" className="text-primary text-xs mt-1 text-center" />
        <Text text=" 급 독서광" type="body1" className="text-gray-300 text-xs mt-1 text-center" />

        </View>
      </View>
          {books.map((book, index) => (
              <BookHorizontal
                id={book.id}
                title={book.title}
                pages={book.pages}
                height={book.height}
                color={undefined}
                scale={scaleFactor}
                key={book.id}
              />
          ))}
      </ScrollView>
    </View>
  );
};
