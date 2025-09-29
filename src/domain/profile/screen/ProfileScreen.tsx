import React, { useCallback, useState } from 'react';
import { ScrollView, View,Alert, Linking, Platform } from 'react-native';
import { Background } from "@/shared/component/Background";
import { Text } from "@/shared/component/Text";
import { MenuItem } from "../component/MenuItem";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from '@/shared/nav/stack/Profile';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useShowTabBar} from '@store/tabStore';
import { APP_STORE_URL, MAIL_ADDRESS, PLAY_STORE_URL} from '@constant/normal';
import { useAuthStore } from '@store/authStore';
import {AuthButton} from '../component/AuthButton';
  type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export const ProfileScreen = () => {
  const { isLoggedIn } = useAuthStore();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const { handleGoogleLogin, handleAppleLogin } = useAuthStore();


  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await handleGoogleLogin();
    } catch (e: any) {
      Alert.alert('로그인 오류', e?.message ?? '구글 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleGoogleLogin]);

  const signInWithApple = useCallback(async () => {
    setLoading(true);
    try {
      await handleAppleLogin();
    } catch (e: any) {
      Alert.alert('로그인 오류', e?.message ?? 'Apple 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleAppleLogin]); 
  const showTabBar = useShowTabBar();
  useFocusEffect(() => {
    showTabBar();
  });
  const handleEmailPress = async () => {
    const mailtoUrl = `mailto:${MAIL_ADDRESS}`;
    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      console.log('supported', supported);
      if (supported) {
        await Linking.openURL(mailtoUrl);
        return;
      } else {
        Alert.alert(
          '문의하기',
          `아래 주소로 메일을 보내주세요.\n\n${MAIL_ADDRESS}`,
          [{ text: '확인' }],
          { cancelable: true }
        );
      }
    } catch (error) {
      Alert.alert(
        '문의하기',
        `아래 주소로 메일을 보내주세요.\n\n${MAIL_ADDRESS}`,
        [{ text: '확인' }],
        { cancelable: true }
      );
    }
  };
  const handleInquiryPress = () => {
    navigation.navigate('Webview', {
      url: 'https://forms.gle/TM1tZhp27ytukWNKA',
      title: '건의사항 및 의견 보내기'
    })
  }

  return (
    <Background>
      <View className="flex-1">
        {/* 헤더 */}
        <View className="px-6 py-4">
          <Text text="Profile" type="title1" className="text-white" />
        </View>

        {/* 메뉴 리스트 */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* 사용자 정보 섹션 */}
          {/* <View className="mb-6">
            <View className="px-6 py-4">
              <Text text="사용자 정보" type="body2" className="text-gray-400 uppercase tracking-wide" />
            </View>
            <MenuItem
              title="내 정보"
              subtitle="프로필 수정 및 개인정보 관리"
              onPress={() => handleMenuPress('내 정보')}
            />
          </View> */}
          {!isLoggedIn && (
             <View 
             className="w-full items-center justify-center p-6 border-b border-gray800"
             >
              <Text text="로그인 하기" type="title3" className="text-white mb-4" />
              <View className="w-1/2 gap-y-4">
              <AuthButton type="google" handleLogin={signInWithGoogle} loading={loading} />
              {Platform.OS === 'ios' && <AuthButton type="apple" handleLogin={signInWithApple} loading={loading} />}
              </View>

             </View>
          )}
          {isLoggedIn && (
            <>
             <View className="mb-6">
            <View className="px-6 py-4">
              <Text text="내 정보" type="body2" className="text-gray-400 uppercase tracking-wide" />
            </View>
             <MenuItem
              title="내 정보"
              subtitle="프로필 수정 및 개인정보 관리"
              onPress={() => { navigation.navigate('MyInfo');}}
            />
            </View>
             {/* 독서 관련 섹션 */}
          <View className="mb-6">
            <View className="px-6 py-4">
              <Text text="독서 관리" type="body2" className="text-gray-400 uppercase tracking-wide" />
            </View>
            <MenuItem
              title="읽고 있는 책"
              subtitle="현재 읽는 중인 책들 목록"
              onPress={() => { navigation.navigate('ReadingList', { mode: 'reading' }); } }
            />
            <MenuItem
              title="읽고 싶은 책"
              subtitle="위시리스트 및 읽기 전 책들 목록"
              onPress={() => { navigation.navigate('ReadingList', { mode: 'wishlist' }); } }
            />
             <MenuItem
                title="독서 통계"
                subtitle="월별, 연도별 독서 현황"
                onPress={() => { navigation.navigate('Statistics');}}
            />
          </View>
            </>
          )}
         
         <View className="mb-6">
            <View className="px-6 py-4">
              <Text text="지원" type="body2" className="text-gray-400 uppercase tracking-wide" />
            </View>
            {/* <MenuItem
              title="도움말"
              subtitle="자주 묻는 질문 및 사용법"
              onPress={() => handleMenuPress('도움말')}
            /> */}
            <MenuItem
            title="문의하기"
            subtitle="이메일로 문의하기"
            onPress={handleEmailPress}
          />
          <MenuItem
            title="건의하기"
            subtitle="건의사항 및 의견 보내기"
            onPress={handleInquiryPress}
          />
           <MenuItem
              title="스토어로 이동"
              subtitle={`${Platform.OS === 'ios' ? '앱 스토어' : '플레이 스토어'}로 이동`}
              onPress={() => Linking.openURL(Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL)}
            />
          </View>
          
         
         

          

         
          {/* 하단 여백 */}
          <View className="h-16" />
        </ScrollView>
      </View>
    </Background>
  );
};