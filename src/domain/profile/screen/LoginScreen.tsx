import { useCallback, useEffect, useState } from 'react';
import { View, Platform, Alert } from 'react-native';
import { Background } from '@/shared/component/Background';
import { Text } from '@/shared/component/Text';
import { useHideTabBar, useShowTabBar } from '@/shared/store/tabStore';
import { useAuthStore } from '@/shared/store/authStore';
import LogoIcon from '@assets/svgs/LogoReadIn.svg';
import { AuthButton } from '../component/AuthButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export const LoginScreen = () => {
  const hideTabBar = useHideTabBar();
  const showTabBar = useShowTabBar();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, [hideTabBar, showTabBar]);
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

  return (
    <Background isBottomGap={false}>
      <View className="flex-1">
        {/* 로고 , 문구 */}
        <View className="flex-1 items-center justify-center">
          <LogoIcon width={100} height={100} />
          <Text text="Read" type="title1" className="text-white" />
          <Text text="Record" type="title1" className="text-white" />
          <Text text="Remember" type="title1" className="text-white" />
        </View>
        {/* 로그인 버튼 */}
        <View className="py-10 pb-14 px-12 w-full h-auto bg-gray900 justify-end"
        style={{paddingBottom: insets.bottom + 16}}>
          <Text text="터치 한 번으로 시작하기" type="title1" className="text-white mb-6" />
          <AuthButton handleLogin={signInWithGoogle} loading={loading} type="google" />
          
        {Platform.OS === 'ios' && (
          <View className="mt-3">
          <AuthButton handleLogin={signInWithApple} loading={loading} type="apple" />
          </View>
          )}
          </View>
      </View>
    </Background>
  );
};


