import React, { useCallback, useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Background } from '@/shared/component/Background';
import { Text } from '@/shared/component/Text';
import { supabase } from '@/shared/libs/supabase/supabase';
import { useHideTabBar, useShowTabBar } from '@/shared/store/tabStore';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export const LoginScreen = () => {
  const hideTabBar = useHideTabBar();
  const showTabBar = useShowTabBar();

  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, [hideTabBar, showTabBar]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      }
    } catch (e: any) {
      setError(e?.message ?? '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = (userInfo as any)?.idToken;
      if (idToken) {
        const { data, error: supaError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        if (supaError) {
          setError(supaError.message);
        }
      } else {
        throw new Error('Google ID 토큰을 가져오지 못했습니다.');
      }
    } catch (e: any) {
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
        // 사용자가 로그인 플로우 취소
      } else if (e?.code === statusCodes.IN_PROGRESS) {
        // 이미 진행중
      } else if (e?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Play Services가 사용 불가하거나 업데이트가 필요합니다.');
      } else {
        setError(e?.message ?? '구글 로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Background>
      <View className="flex-1 px-6 py-8">
        <Text text="로그인" type="title1" className="text-white mb-6" />
        <View className="gap-3">
          <TextInput
            placeholder="이메일"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            className="bg-background text-white rounded-xl px-4 py-3 border border-primary"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="비밀번호"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            className="bg-background text-white rounded-xl px-4 py-3 border border-primary"
            value={password}
            onChangeText={setPassword}
          />
          {error ? (
            <Text text={error} type="caption1" className="text-red-400" />
          ) : null}
          <TouchableOpacity
            onPress={onLogin}
            disabled={loading}
            className="bg-primary rounded-xl py-4 items-center mt-2"
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text text="로그인" type="body1" className="text-white font-semibold" />
            )}
          </TouchableOpacity>
        </View>
        <View className="mt-6">
          <TouchableOpacity
            onPress={signInWithGoogle}
            disabled={loading}
            className="bg-white rounded-xl py-4 items-center"
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <Text text="Google로 로그인" type="body1" className="text-black font-semibold" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Background>
  );
};


