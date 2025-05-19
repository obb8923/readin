import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert, Dimensions, TextInput, Button, Platform, LayoutChangeEvent, Animated, SectionList } from 'react-native';
import { ReviewWithBook, updateReview, deleteReview } from '../../../libs/supabase/supabaseOperations';
import useReviewStore from '../../../store/reviewStore';
import { supabase } from '../../../libs/supabase/supabase';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../nav/stack/Home';
import SearchIcon from '../../../../assets/svgs/Search.svg';
import GridIcon from '../../../../assets/svgs/Grid.svg';
import ListIcon from '../../../../assets/svgs/List.svg';
import Background from '../../../components/Background';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../../../constants/Colors';
import Divider from '../../../components/Divider';
import useModal from '../../../libs/hooks/useModal';
// 화면 너비 가져오기 (책장형 레이아웃 계산용)
const screenWidth = Dimensions.get('window').width;
const numColumnsBookshelf = 4; // 책장형 열 개수
const bookshelfItemMargin = 8; // 아이템 간 마진
// 부모 View (p-4)의 좌우 패딩 합 (1rem = 16px 가정, 16px * 2 = 32px)
const parentHorizontalPadding = 32;
const availableWidthForFlatList = screenWidth - parentHorizontalPadding;
// 각 아이템의 순수 너비 계산: (사용 가능 너비 / 컬럼 수) - (아이템 좌우 마진 합)
const bookshelfItemSize = (availableWidthForFlatList / numColumnsBookshelf) - (2 * bookshelfItemMargin);

// --- 서명된 URL을 사용하여 이미지를 표시하는 새 컴포넌트 ---
const BookshelfImageItem = ({ imagePath, onPress }: { imagePath: string | null | undefined, onPress: () => void }) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const isSupabasePath = (path: string) => {
    // HTTP 또는 HTTPS로 시작하지 않으면 Supabase 내부 경로로 간주
    return path && !path.startsWith('http://') && !path.startsWith('https://');
  };

  useEffect(() => {
    if (imagePath && imagePath.trim() !== '') {
      if (isSupabasePath(imagePath)) {
        const fetchSignedUrl = async () => {
          setIsLoadingUrl(true);
          setSignedUrl(null); 
          try {
            const { data, error } = await supabase.storage
              .from('book-thumbnail')
              .createSignedUrl(imagePath, 3600); 

            if (error) {
              console.error('Error fetching signed URL for bookshelf item:', imagePath, error);
              setSignedUrl(null);
            } else if (data) {
              setSignedUrl(data.signedUrl);
            }
          } catch (e) {
            console.error('Exception fetching signed URL:', imagePath, e);
            setSignedUrl(null);
          }
          setIsLoadingUrl(false);
        };
        fetchSignedUrl();
      } else {
        // 외부 URL (예: 카카오 서버 이미지)인 경우 그대로 사용
        setSignedUrl(imagePath);
        setIsLoadingUrl(false);
      }
    } else {
      setSignedUrl(null); 
      setIsLoadingUrl(false);
    }
  }, [imagePath]);

  return (
    <TouchableOpacity
      style={{ width: bookshelfItemSize, height: bookshelfItemSize * 1.5, margin: bookshelfItemMargin }}
      onPress={onPress}
      disabled={isLoadingUrl} // 로딩 중에는 클릭 방지
    >
      {isLoadingUrl ? (
        <View className="w-full h-full rounded-md bg-gray-200 items-center justify-center">
          <ActivityIndicator size="small" color={Colors.svggray} />
        </View>
      ) : signedUrl ? (
        <Image
          source={{ uri: signedUrl }}
          className="w-full h-full rounded-md bg-gray-100" // 로딩 전 배경색 변경
          resizeMode="cover"
          onError={(e) => {
            console.warn('Error loading image with signed URL:', signedUrl, e.nativeEvent.error);
            setSignedUrl(null); // 이미지 로드 실패 시 URL 제거 (플레이스홀더 표시 유도)
          }}
        />
      ) : (
        <View className="w-full h-full rounded-md bg-gray-300 items-center justify-center">
          <Text className="text-xs text-gray-500 text-center p-1">이미지 없음</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

type HomeScreenProps = NativeStackScreenProps<
HomeStackParamList,
'Home'
>;
export default function HomeScreen({navigation}: HomeScreenProps) {
  const { reviews, isLoading, error, fetchReviews, getGroupedReviews,getReviewsForBookshelf } = useReviewStore();
  const [viewMode, setViewMode] = useState<'list' | 'bookshelf'>('list'); // 보기 모드 상태
  const { show, hide } = useModal();
 
  // --- 리스트형 아이템 렌더러 (SectionList의 renderItem으로 사용) ---
  const renderReviewItem = ({ item }: { item: ReviewWithBook }) => {
    const progressWidth = item.progress || 0;
    const rating = Math.max(0, Math.min(100, item.rating || 0));
    const bgOpacity = rating <= 10 ? 0.1 : rating / 100;

    return (
      <TouchableOpacity onPress={() => show('modifyReview',item,null)}>
        <View className="bg-transparent mb-3 rounded-lg overflow-hidden h-12 justify-center relative">
          {/* 진행도 및 평점 배경 */}
          <View
            className={`absolute top-0 left-0 right-0 bottom-0 bg-skyblue`}
            style={{ width: `${progressWidth}%`, opacity: bgOpacity }}
          />
          <Text
            className="text-base font-semibold z-10 px-3"
            numberOfLines={1}
          >
            {item.books?.title || '제목 없음'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // --- 책장형 아이템 렌더러 (새로운 BookshelfImageItem 컴포넌트 사용) ---
  const renderBookshelfItem = ({ item }: { item: ReviewWithBook }) => (
    <BookshelfImageItem
      imagePath={item.books?.image_url} // 이제 image_url은 경로임
      onPress={() => show('modifyReview', item, null)}
    />
  );

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [fetchReviews])
  );

  useEffect(() => {
    if (error) {
      console.log('리뷰 로딩 오류 (from store):', error);
      Alert.alert("오류", "리뷰를 불러오는 중 문제가 발생했습니다.");
    }
  }, [error]);

  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });

  }, []);

  return (
    <Background style={{}}>
      {/* 내부 컨테이너 */}
      <View className="flex-1 p-4">
      {/* 책 추가 버튼 */}
      <TouchableOpacity
        className="flex-row items-center h-12 bg-white border border-gray-300 rounded-lg mb-4 px-3"
        onPress={() => navigation.navigate('BookSearch')}
      >
        <SearchIcon className="w-6 h-6" style={{marginRight: 8, color: Colors.svggray2}}/>
        <Text className="font-p text-base text-gray-400">읽은 책 추가하기...</Text>
      </TouchableOpacity>

      {/* 컨트롤 영역: 책 개수 및 보기 모드 전환 */}
      {!isLoading && reviews.length > 0 && (
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="font-p text-sm text-gray-600">총 {reviews.length}권</Text>
          <View className="flex-row items-center justify-center">
            <TouchableOpacity onPress={() => setViewMode('list')}>
              <ListIcon style={{color: viewMode === 'list' ? Colors.black : Colors.svggray2}} className={`w-6 h-6`} />
            </TouchableOpacity>
            <View className='w-3'/>
            <TouchableOpacity onPress={() => setViewMode('bookshelf')}>
              <GridIcon style={{color: viewMode === 'bookshelf' ? Colors.black : Colors.svggray2}} className={`w-6 h-6`} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 콘텐츠 영역: 로딩, 빈 상태, 리스트/책장 */}
      <View className="flex-1">
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.svggray} className="mt-10" />
        ) : reviews.length === 0 ? (
          <Text className="text-gray-500 text-center mt-10 text-base font-p">아직 추가된 책이 없습니다.</Text>
        ) : viewMode === 'list' ? (
          // --- 리스트형 보기 ---
          <SectionList
            sections={getGroupedReviews()} // 그룹화된 데이터 사용
            keyExtractor={(item, index) => `list-${item.id?.toString() || item.isbn}-${index}`}
            renderItem={renderReviewItem}
            renderSectionHeader={({ section: { title } }) => (
             <Divider text={title}  className="mt-2 mb-2"/>
            )}
            contentContainerStyle={{ paddingBottom: 16 }}
            ListEmptyComponent={<Text className="text-gray-500 text-center mt-10 text-base font-p">아직 추가된 책이 없습니다.</Text>}
          />
        ) : (
          // --- 책장형 보기 ---
          <FlatList
            key={`flatlist-${viewMode}`}
            data={getReviewsForBookshelf()}
            renderItem={renderBookshelfItem}
            keyExtractor={(item) => `shelf-${item.id?.toString() || item.isbn}`}
            numColumns={numColumnsBookshelf}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
      </View>
   
    </Background>
  );
}

