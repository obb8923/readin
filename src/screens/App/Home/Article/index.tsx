import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../../../nav/stack/Home";
import { useEffect, useState, useCallback, useRef } from "react";
import { fetchPostDetailsById, PostDetail, addLike, removeLike } from "../../../../libs/supabase/supabaseOperations";
import { supabase } from "../../../../libs/supabase/supabase";
import Background from "../../../../components/Background";
import Colors from "../../../../constants/Colors";
import HeartIcon from "../../../../../assets/svgs/Heart.svg";
import EyesOpen from "../../../../../assets/svgs/EyesOpen.svg";
import BookIcon from "../../../../../assets/svgs/Book.svg";
import { getTimeAgo } from "../../../../libs/utils/time";

const ArticleScreen = ({ route, navigation }: NativeStackScreenProps<HomeStackParamList, 'Article'>) => {
  const { postId } = route.params;
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookInfo, setShowBookInfo] = useState(false);

  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const likeDebounceTimer = useRef<NodeJS.Timeout | null>(null); 
console.log('post', post)
  const loadPostDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await fetchPostDetailsById(postId);
      if (fetchError) {
        throw fetchError;
      }
      if (data) {
        setPost(data);
      } else {
        throw new Error("게시글을 찾을 수 없습니다.");
      }
    } catch (err: any) {
      console.error("게시글 상세 정보 로드 오류:", JSON.stringify(err, null, 2));
      setError(err.message || "게시글을 불러오는 중 오류가 발생했습니다.");
      Alert.alert("오류", err.message || "게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPostDetails();
  }, [loadPostDetails]);

  const toggleLike = async () => {
    if (!post) return;

    const originalIsLiked = post.isLiked;
    const originalLikesCount = post.likes_count || 0;

    const newIsLiked = !post.isLiked;
    const newLikesCount = newIsLiked ? originalLikesCount + 1 : Math.max(0, originalLikesCount - 1);
    setPost(prevPost => prevPost ? { ...prevPost, isLiked: newIsLiked, likes_count: newLikesCount } : null);

    if (likeDebounceTimer.current) {
      clearTimeout(likeDebounceTimer.current);
    }

    likeDebounceTimer.current = setTimeout(async () => {
      setIsTogglingLike(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        let operationSuccess = false;
        if (newIsLiked) {
          const { success, error: likeError } = await addLike(post.id, user.id);
          if (likeError) throw likeError;
          operationSuccess = success;
        } else {
          const { success, error: unlikeError } = await removeLike(post.id, user.id);
          if (unlikeError) throw unlikeError;
          operationSuccess = success;
        }

        if (!operationSuccess){
            throw new Error("좋아요 처리 중 서버에서 실패 응답을 받았습니다.");
        }

      } catch (err: any) {
        console.error('좋아요 토글 서버 요청 중 오류 발생:', JSON.stringify(err, null, 2));
        setPost(prevPost => prevPost ? { ...prevPost, isLiked: originalIsLiked, likes_count: originalLikesCount } : null);
        Alert.alert("오류", err.message || "좋아요 처리 중 오류가 발생했습니다.");
      } finally {
        setIsTogglingLike(false);
        if (likeDebounceTimer.current) { 
            likeDebounceTimer.current = null; 
        }
      }
    }, 1000);
  };
  
  useEffect(() => {
    return () => {
      if (likeDebounceTimer.current) {
        clearTimeout(likeDebounceTimer.current);
      }
    };
  }, []);

  if (loading) {
    return <Background><View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color={Colors.skyblue} /></View></Background>;
  }

  if (error || !post) {
    return <Background><View className="flex-1 justify-center items-center"><Text className="font-p text-red-500">{error || "게시글을 찾을 수 없습니다."}</Text></View></Background>;
  }

  return (
    <Background>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}>
        <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200">
          <Text className="font-p-semibold text-base text-gray-700">
            {post.users?.nickname || "누군가"}
          </Text>
          <Text className="font-p text-xs text-gray-500">
            {getTimeAgo(post.created_at)}
          </Text>
        </View>

        <Text className="font-p text-lg text-black mb-8 leading-relaxed">
          {post.content || "내용 없음"}
        </Text>

        <View className="flex-row justify-end items-center pt-4 mb-8">
          <EyesOpen style={{ width: 18, height: 18, color: Colors.svggray2, marginRight: 5 }} />
          <Text className="font-p-semibold text-base text-svggray2 mr-5">{post.views ?? 0}</Text>
          
          <TouchableOpacity 
            onPress={toggleLike}
            disabled={isTogglingLike}
            className="flex-row items-center p-2" 
          >
            <HeartIcon style={{
              width: 18, 
              height: 18, 
              color: post.isLiked ? Colors.red : Colors.svggray2,
              marginRight: 5
            }} />
            <Text className="font-p-semibold text-base text-svggray2">{post.likes_count ?? 0}</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <TouchableOpacity
            onPress={() => post.books && setShowBookInfo(!showBookInfo)}
            disabled={!post.books}
            className="flex-row items-center justify-start p-2 rounded-lg mb-3"
          >
            {post.books && (
              <BookIcon style={{ color: Colors.svggray, marginRight: 8, width: 18, height: 18 }} />
            )}
            <Text className={`font-p-semibold text-lg ${post.books ? 'text-gray-500' : 'text-gray-400'}`}>
              {post.books ? (showBookInfo ? "책 정보 숨기기" : "책 정보 확인") : "책 정보 없음"}
            </Text>
          </TouchableOpacity>

          {post.books && showBookInfo && (
            <View className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
              <View className="flex-row">
                {post.books.image_url && (
                  <Image 
                    source={{ uri: post.books.image_url }}
                    className="w-24 h-36 rounded-md mr-4"
                    resizeMode="cover"
                  />
                )}
                <View className="flex-1">
                  <Text className="font-p-bold text-xl mb-2 text-bluegray-700">{post.books.title || "책 제목 없음"}</Text>
                  {post.books.author && <Text className="font-p text-base text-gray-600">저자: {post.books.author}</Text>}
                </View>
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </Background>
  );
};

export default ArticleScreen;