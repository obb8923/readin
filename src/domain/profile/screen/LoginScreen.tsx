import React, { useCallback, useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Background } from '@/shared/component/Background';
import { Text } from '@/shared/component/Text';
import { supabase } from '@/shared/libs/supabase/supabase';
import { useHideTabBar, useShowTabBar } from '@/shared/store/tabStore';

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
      </View>
    </Background>
  );
};


