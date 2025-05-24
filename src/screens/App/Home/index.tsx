import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Animated } from "react-native";
import Background from "../../../components/Background";
import { useState, useCallback, useEffect, useRef } from "react";
import Write from "../../../../assets/svgs/Write.svg";
import Colors  from "../../../constants/Colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../../nav/stack/Home";
import { supabase } from "../../../libs/supabase/supabase"; // Supabase 클라이언트 import
import HeartIcon from "../../../../assets/svgs/Heart.svg";
import EyesOpen from "../../../../assets/svgs/EyesOpen.svg";
import { getTimeAgo } from "../../../libs/utils/time"; // getTimeAgo 임포트 경로 수정
// addLike, removeLike 임포트 추가
import { addLike, removeLike } from "../../../libs/supabase/supabaseOperations";
// Post 타입 정의 (Supabase 테이블 구조 및 JOIN 관계 반영)
type Post = {
  id: string; // posts.id (uuid)
  created_at: string; // posts.created_at
  content: string | null; // posts.content
  updated_at: string | null; // posts.updated_at
  views: number | null; // posts.views
  likes: number | null; // 이 필드는 서버 응답의 likes_count와 매핑됨
  user_id: string; // posts.user_id (uuid)
  isbn: string | null; // posts.isbn
  isLiked: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부
  books: { // posts.isbn을 통해 JOIN된 books 테이블 정보
    title: string | null;
    image_url: string | null;
  } | null;
  users: { // posts.user_id를 통해 JOIN된 public.users 테이블 정보
    nickname: string | null; // public.users 테이블의 이름 컬럼 (실제 컬럼명 확인 필요)
  } | null;
};

// likes 테이블에서 가져오는 데이터의 타입 (isLiked 계산용)
interface UserLikeRecord {
  user_id: string;
}

interface BookRecordFromSupabase { title: string | null; image_url: string | null; }
interface UserRecordFromSupabase { nickname: string | null; }

// Supabase 데이터 로드 시 예상되는 객체 구조 (select 쿼리에 맞춤)
interface FetchedPostFromSupabase {
  id: string; 
  created_at: string; 
  content: string | null; 
  updated_at: string | null; 
  views: number | null; 
  likes_count: number | null; // posts 테이블의 실제 좋아요 수 컬럼
  user_id: string; 
  isbn: string | null; 
  books: BookRecordFromSupabase[] | null; // Supabase는 관계를 배열로 반환할 수 있음
  users: UserRecordFromSupabase | null; // users 필드는 단일 객체 또는 null 입니다.
  user_like_records: UserLikeRecord[] | null; // 사용자의 좋아요 기록 (likes 테이블 join 결과)
}

const POSTS_PER_PAGE = 10; // 페이지당 게시물 수

const HomeScreen = ({navigation}: NativeStackScreenProps<HomeStackParamList, 'Home'>) => {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];
  const [isTogglingLike, setIsTogglingLike] = useState<{[postId: string]: boolean}>({}); // 포스트별 좋아요 토글 로딩 상태
  const likeDebounceTimers = useRef<{[postId: string]: NodeJS.Timeout}>({}); // 포스트별 디바운스 타이머 참조

  // 좋아요 토글 함수 (디바운싱 적용)
  const toggleLike = async (postId: string) => {
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    // 최초 클릭 시점의 상태를 스냅샷으로 저장 (롤백 기준점)
    // 이 스냅샷은 서버 요청 실패 시 UI를 되돌릴 때 사용됩니다.
    const originalPostStateSnapshot = posts.find(p => p.id === postId && !likeDebounceTimers.current[postId]) 
                                      ? { ...posts[postIndex] } 
                                      : null; // 이미 디바운스 진행 중이면 새 스냅샷 안 만듦 (최초 스냅샷 유지)

    // 현재 화면에 표시된 isLiked 상태를 가져와서 즉시 UI를 토글합니다.
    const currentDisplayedIsLiked = posts[postIndex].isLiked;
    const newIsLikedForImmediateUi = !currentDisplayedIsLiked;
    const newLikesCountForImmediateUi = newIsLikedForImmediateUi
                          ? (posts[postIndex].likes || 0) + 1
                          : Math.max(0, (posts[postIndex].likes || 0) - 1);

    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, isLiked: newIsLikedForImmediateUi, likes: newLikesCountForImmediateUi } : p
      )
    );

    if (likeDebounceTimers.current[postId]) {
      clearTimeout(likeDebounceTimers.current[postId]);
    }

    likeDebounceTimers.current[postId] = setTimeout(async () => {
      setIsTogglingLike(prev => ({ ...prev, [postId]: true })); 
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // 서버 요청을 위해 UI 업데이트 후의 isLiked 상태를 사용
        // (만약 여러번 빠르게 토글 시 최종 상태를 반영하기 위해 다시 읽을 수도 있지만, 현재 로직은 즉시 반영된 newIsLikedForImmediateUi를 사용)
        const finalIsLikedForServerRequest = newIsLikedForImmediateUi; 
        
        let operationSuccess = false;
        if (finalIsLikedForServerRequest) { // 좋아요 추가
          const { success, error: likeError } = await addLike(postId, user.id);
          if (likeError) throw likeError;
          operationSuccess = success;
        } else { // 좋아요 취소
          const { success, error: unlikeError } = await removeLike(postId, user.id);
          if (unlikeError) throw unlikeError;
          operationSuccess = success;
        }
        
        if (!operationSuccess){
            throw new Error("좋아요 처리 중 서버에서 실패 응답을 받았습니다.");
        }

      } catch (error) {
        console.error('좋아요 토글 서버 요청 중 오류 발생:', error);
        if (originalPostStateSnapshot) {
          setPosts(prevPosts =>
            prevPosts.map(p => (p.id === postId ? originalPostStateSnapshot : p))
          );
        }
        // 사용자에게 오류 알림 (예: Alert.alert 또는 스낵바)
      } finally {
        setIsTogglingLike(prev => ({ ...prev, [postId]: false }));
        delete likeDebounceTimers.current[postId];
      }
    }, 1000); // 디바운스 시간을 ArticleScreen과 일관성 있게 1초로 변경 (기존 3초)
  };
  
  // 컴포넌트 언마운트 시 모든 디바운스 타이머 정리
  useEffect(() => {
    const timers = likeDebounceTimers.current;
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // 데이터 리셋 및 새로고침 함수
  const onRefresh = useCallback(async (newTab?: 'latest' | 'popular') => {
    setRefreshing(true);
    setPage(1); // 페이지 초기화
    setPosts([]); // 기존 포스트 초기화
    setHasMore(true); // 더 불러올 데이터가 있다고 가정
    await loadPosts(1, newTab || activeTab, true); // page 1부터, 지정된 탭(또는 현재 탭)으로, 리프레시로 호출됨을 알림
    setRefreshing(false);
  }, [activeTab]); // activeTab이 변경될 때 onRefresh 함수 자체도 새로 생성되도록 의존성 배열에 추가

  // 데이터 로드 함수
  const loadPosts = useCallback(async (pageNum: number = page, tab: 'latest' | 'popular' = activeTab, isRefresh: boolean = false) => {
    if (loading && !isRefresh) return;
    if (!hasMore && !isRefresh) return;

    setLoading(true);
    
    const from = isRefresh ? 0 : (pageNum - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    let orderByField: string = 'created_at'; // Supabase order의 key는 string
    let ascending = false;

    if (tab === 'popular') {
      orderByField = 'likes_count'; 
    }

    try {
      // 현재 사용자 ID 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      let query = supabase
        .from('posts')
        .select(`
          id,
          created_at,
          content,
          updated_at,
          views,
          likes_count, 
          user_id,
          isbn,
          books (title, image_url),
          users (nickname),
          user_like_records:likes!left (
            user_id
          )
        `)
        .order(orderByField, { ascending: ascending })
        .range(from, to);

      // 현재 로그인한 사용자의 글은 제외
      if (currentUserId) {
        query = query.neq('user_id', currentUserId);
      }

      const { data, error } = await query;

      if (error) {
        // Supabase 에러 객체의 상세 내용을 JSON 문자열로 로깅
        console.error('Supabase select error details:', JSON.stringify(error, null, 2));
        throw error; // 에러를 다시 throw하여 catch 블록에서 처리하도록 함
      }
      
      if (!data) { // data가 null인 경우 (오류는 없었지만 데이터가 없는 경우)
        console.warn('Supabase returned null data.');
        setPosts(isRefresh ? [] : posts); // 새로고침이면 비우고, 아니면 기존 유지
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      // data가 FetchedPostFromSupabase[] 타입이라고 단언
      console.log('Supabase에서 받아온 원본 data:', data);
      const fetchedPosts = data as unknown as FetchedPostFromSupabase[];

      const mappedPosts: Post[] = fetchedPosts.map(p => {
        const book = p.books && p.books.length > 0 ? p.books[0] : null;
        const user = p.users; // users가 단일 객체 또는 null이므로, 바로 할당합니다.
        const isLiked = !!(p.user_like_records && p.user_like_records.some(like => like.user_id === currentUserId));

        return {
          id: p.id,
          created_at: p.created_at,
          content: p.content,
          updated_at: p.updated_at,
          views: p.views,
          likes: p.likes_count, 
          user_id: p.user_id,
          isbn: p.isbn,
          books: book,
          users: user,
          isLiked: isLiked,
        };
      });
      
      const newPosts = mappedPosts;

      if (newPosts.length < POSTS_PER_PAGE && !isRefresh) {
        setHasMore(false);
      }

      if (isRefresh) {
        setPosts(newPosts);
      } else {
        setPosts(prevPosts => {
          const currentPostIds = new Set(prevPosts.map(post => post.id));
          const uniqueNewPosts = newPosts.filter(post => !currentPostIds.has(post.id));

          if (uniqueNewPosts.length < newPosts.length) {
            console.warn("중복 아이템 필터링됨: 원래 새 포스트 수:", newPosts.length, "고유한 새 포스트 수:", uniqueNewPosts.length);
          }
          
          return uniqueNewPosts.length > 0 ? [...prevPosts, ...uniqueNewPosts] : prevPosts;
        });
      }
      
      if (newPosts.length > 0 && !isRefresh) { // 리프레시가 아닐 때만 페이지 증가
        setPage(prev => prev + 1);
      } else if (isRefresh) { // 리프레시일 때는 페이지를 2로 설정 (다음 로드를 위해)
        setPage(2);
      }

    } catch (error: any) { // catch 블록의 error 타입을 any로 명시
      // 여기서도 에러 객체의 상세 내용을 로깅
      console.error('데이터 로드 중 오류 발생 (상세):', JSON.stringify(error, null, 2));
      // UI에 표시될 메시지는 기존처럼 간단하게 유지하거나, 필요시 error.message 사용
      // Alert.alert("데이터 로드 오류", error?.message || "데이터를 불러오는 중 문제가 발생했습니다."); 
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, loading, hasMore, posts]); // posts를 의존성 배열에 추가 (setPosts([]) 사용 시)

  // 초기 데이터 로드
  useEffect(() => {
    onRefresh('latest'); // 초기 로드는 최신순으로
  }, []);

  // 탭 전환 함수
  const handleTabChange = (tab: 'latest' | 'popular') => {
    if (activeTab === tab && posts.length > 0) return;

    const toValue = tab === 'latest' ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();

    setActiveTab(tab);
    onRefresh(tab);
  };

  // 글 아이템 렌더링
  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      className="bg-white pt-4 px-4 rounded-lg mb-4 shadow-sm"
      onPress={() => navigation.navigate('Article', { postId: item.id })} 
    >
      {/* 사용자 이름과 시간 표시 */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-p text-xs text-gray-500">
          {item.users?.nickname || '누군가'}
        </Text>
        <Text className="font-p text-xs text-gray-500">
          {getTimeAgo(item.created_at)}
        </Text>
      </View>
      {/* 글 내용 */}
      <Text className="font-p text-base text-black mb-3" numberOfLines={15}>
        {item.content || '내용 없음'}
      </Text>
      {/* views , like 버튼 */}
      <View className="flex-row justify-end items-center">
        <EyesOpen style={{ width: 15, height: 14, color: Colors.svggray2,marginRight:2 }} />
        <Text className="font-p-semibold text-xs text-svggray2">{item.views ?? 0}</Text>
        <TouchableOpacity 
          onPress={() => toggleLike(item.id)} // currentIsLikedLocal 인자 제거
          disabled={isTogglingLike[item.id]} // 로딩 중 버튼 비활성화
          className="flex-row justify-center items-center py-4 pl-4" // 터치 영역 확보를 위해 패딩 추가 고려 이미 4정도 줌
        > 
          <HeartIcon style={{ 
            width: 13, 
            height: 12, 
            color: item.isLiked ? Colors.red : Colors.svggray2,
            marginLeft: 8,
            marginRight: 2 
          }} />
          <Text className="font-p-semibold text-xs text-svggray2">{item.likes ?? 0}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Background>
      <View className="flex-1">
        {/* 탭 버튼 */}
        <View className="flex-row justify-between items-center py-4 relative">
          <TouchableOpacity 
            onPress={() => handleTabChange('latest')}
            className={`px-6 py-2 h-10 w-1/2 justify-center items-center`}
          >
            <Text className={`font-p text-lg ${activeTab === 'latest' ? 'text-black' : 'text-svggray2' }`}>최신순</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleTabChange('popular')}
            className={`px-6 py-2 h-10 w-1/2 justify-center items-center`}
          >
            <Text className={`font-p text-lg ${activeTab === 'popular' ? 'text-black' : 'text-svggray2'}`}>인기순</Text>
          </TouchableOpacity>
          <Animated.View 
            className="absolute bottom-0 h-0.5 bg-black"
            style={{
              width: '50%',
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 200]
                })
              }]
            }}
          />
        </View>

        {/* 글 목록 */}
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          onEndReached={() => loadPosts()} // isRefresh 기본값 false
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => onRefresh()}
              colors={[Colors.skyblue]}
              tintColor={Colors.skyblue}
            />
          }
          ListFooterComponent={() => (
            loading && !refreshing ? (
              <View className="py-4">
              <ActivityIndicator size="large" color={Colors.skyblue} />
              </View>
            ) : null
          )}
        />

        {/* 플로팅 버튼 */}
        <TouchableOpacity 
          onPress={() => {
            navigation.navigate('Write');
          }}
          className="absolute bottom-6 right-6 w-14 h-14 bg-bluegray rounded-full items-center justify-center shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Write style={{ width: 24, height: 24, color: Colors.svggray }} />
        </TouchableOpacity>
      </View>
    </Background>
  );
};

export default HomeScreen;