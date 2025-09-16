import React, { useCallback, useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { handleEmailLogin, handleGoogleLogin, handleAppleLogin, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const onLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ok = await handleEmailLogin(email, password);
      if (!ok) setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } catch (e: any) {
      setError(e?.message ?? '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [email, password, handleEmailLogin]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await handleGoogleLogin();
    } catch (e: any) {
      setError(e?.message ?? '구글 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleGoogleLogin]);

  const signInWithApple = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await handleAppleLogin();
    } catch (e: any) {
      setError(e?.message ?? 'Apple 로그인 중 오류가 발생했습니다.');
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
        <View className="py-10 px-12 w-full h-auto bg-gray900 justify-end"
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


