import React, { useMemo } from 'react';
import { View, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Background } from '@/shared/component/Background';
import { Text } from '@/shared/component/Text';
import { Colors } from '@constant/Colors';
import { useIsReadingLogsLoading, useReadingLogs } from '@/shared/store/readingLogsWithBooksStore';
import { transformReadingLogToBookWithRecord } from '@/shared/utils/bookDataTransform';
import { BookImage } from '@/shared/component/BookImage';
import { ProfileStackParamList } from '@/shared/nav/stack/Profile';
import { AppBar } from '@/shared/component/AppBar';
import { useHideTabBar } from '@/shared/store/tabStore';

type ReadingListRouteProp = RouteProp<ProfileStackParamList, 'ReadingList'>;

const is1000DateString = (iso: string | null) => iso?.startsWith('1000-01-01') ?? false;
const is1001DateString = (iso: string | null) => iso?.startsWith('1001-01-01') ?? false;

export const ReadingListScreen = () => {
  const route = useRoute<ReadingListRouteProp>();
  const navigation = useNavigation();
  const { mode } = route.params;
  const hideTabBar = useHideTabBar();
  const isLoading = useIsReadingLogsLoading();
  const readingLogs = useReadingLogs();

  useFocusEffect(() => {
    hideTabBar();
  });

  const filteredLogs = useMemo(() => {
    if (mode === 'wishlist') {
      // 읽기 전: started_at === 1000-01-01
      return readingLogs.filter(log => is1000DateString(log.started_at));
    }
    // 읽는 중: started_at === 1001-01-01
    return readingLogs.filter(log => is1001DateString(log.started_at));
  }, [mode, readingLogs]);

  const books = useMemo(() => filteredLogs.map(transformReadingLogToBookWithRecord), [filteredLogs]);

  if (isLoading) {
    return (
      <Background isTabBarGap={true}>
        <View className="px-6 py-4">
          <Text text={mode === 'wishlist' ? '읽고 싶은 책' : '읽고 있는 책'} type="title1" className="text-white" />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text text="불러오는 중..." className="text-gray-300 text-sm mt-2" />
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <AppBar 
        title={mode === 'wishlist' ? '읽고 싶은 책' : '읽고 있는 책'}
        onLeftPress={() => { navigation.goBack(); }}
      />

      {/* 리스트 */}
      <View className="flex-1 p-4">
        {books.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text text={mode === 'wishlist' ? '읽고 싶은 책이 없습니다' : '읽고 있는 책이 없습니다'} className="text-gray-300 text-sm" />
          </View>
        ) : (
          <FlatList
            data={books}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View
                className="mb-4 flex-row items-center rounded-lg p-4 py-2 h-28 border-b border-gray800"
              >
                <BookImage imageUrl={item.imageUrl} className="mr-4" />
                <View className="flex-1 items-start justify-center">
                  <Text
                    text={item.title}
                    type="title4"
                    className="text-white mb-1"
                    numberOfLines={1}
                  />
                  <Text
                    text={Array.isArray(item.author) ? item.author.join(', ') : String(item.author || '')}
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
              </View>
            )}
          />
        )}
      </View>
    </Background>
  );
};


