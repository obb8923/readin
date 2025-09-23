import React, { useCallback, useState } from 'react';
import { ScrollView, View,Alert, Linking, Platform ,Text as RNText} from 'react-native';
import { Background } from "@/shared/component/Background";
import { Text } from "@/shared/component/Text";
import { MenuItem } from "../component/MenuItem";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from '@/shared/nav/stack/Profile';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useShowTabBar} from '@store/tabStore';
import { MAIL_ADDRESS } from '@constant/normal';
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
          <RNText style={{fontFamily:'Pretendard-Black'}} className="text-white">Profile</RNText>
          <RNText style={{fontFamily:'Pretendard-Bold'}} className="text-white">Profile</RNText>
          <RNText style={{fontFamily:'Pretendard-ExtraBold'}} className="text-white">Profile</RNText>
          <RNText style={{fontFamily:'Pretendard-Medium'}} className="text-white">Profile</RNText>
          <RNText style={{fontFamily:'Pretendard-Regular'}} className="text-white">Profile</RNText>
          <RNText style={{fontFamily:'Pretendard-SemiBold'}} className="text-white">Profile</RNText>

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
             <MenuItem
              title="내 정보"
              subtitle="프로필 수정 및 개인정보 관리"
              onPress={() => { navigation.navigate('MyInfo');}}
            />
            <MenuItem
                title="독서 통계"
                subtitle="월별, 연도별 독서 현황"
                onPress={() => { navigation.navigate('Statistics');}}
            />
            </>
          )}
         
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
          {/* 독서 관련 섹션 */}
          {/* <View className="mb-6">
            <View className="px-6 py-4">
              <Text text="독서 관리" type="body2" className="text-gray-400 uppercase tracking-wide" />
            </View>
            <MenuItem
              title="읽은 책 목록"
              subtitle="완독한 책들의 기록"
              onPress={() => handleMenuPress('읽은 책 목록')}
            />
            <MenuItem
              title="읽고 있는 책"
              subtitle="현재 읽고 있는 책들"
              onPress={() => handleMenuPress('읽고 있는 책')}
            />
            <MenuItem
              title="읽고 싶은 책"
              subtitle="위시리스트 및 읽고 싶은 책들"
              onPress={() => handleMenuPress('읽고 싶은 책')}
            />
            <MenuItem
              title="독서 통계"
              subtitle="월별, 연도별 독서 현황"
              onPress={() => handleMenuPress('독서 통계')}
            />
          </View> */}

          

          {/* 지원 섹션 */}
          {/* <View className="mb-6">
            <View className="px-6 py-4">
              <Text text="지원" type="body2" className="text-gray-400 uppercase tracking-wide" />
            </View>
            <MenuItem
              title="도움말"
              subtitle="자주 묻는 질문 및 사용법"
              onPress={() => handleMenuPress('도움말')}
            />
            <MenuItem
              title="문의하기"
              subtitle="버그 신고 및 개선 제안"
              onPress={() => handleMenuPress('문의하기')}
            />
            <MenuItem
              title="앱 정보"
              subtitle="버전 정보 및 라이선스"
              onPress={() => handleMenuPress('앱 정보')}
            />
          </View> */}
          {/* 하단 여백 */}
          <View className="h-8" />
        </ScrollView>
      </View>
    </Background>
  );
};