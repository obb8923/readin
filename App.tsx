import "./global.css"
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {RootStack} from './src/shared/nav/stack/Root';
import { TabBar } from './src/shared/component/TabBar';
import { useIsTabBarVisible } from './src/shared/store/tabStore';
import { useAuthStore } from '@store/authStore';
import { useFetchReadingLogs } from '@store/readingLogsWithBooksStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SUPABASE_WEB_CLIENT_KEY, SUPABASE_IOS_CLIENT_KEY } from '@env';

export default function App() {
  const isTabBarVisible = useIsTabBarVisible();
  const { isLoggedIn, userId, checkLoginStatus } = useAuthStore();
  const fetchReadingLogs = useFetchReadingLogs();

  useEffect(() => {
    // Google Sign-In 설정
    try {
      GoogleSignin.configure({
        webClientId: SUPABASE_WEB_CLIENT_KEY,
        iosClientId: SUPABASE_IOS_CLIENT_KEY,
        scopes: ['profile', 'email'],
      });
    } catch (error) {
      console.error('[App.tsx] Google Sign-In configuration error:', error);
    }
  }, []);

  // 앱 시작 시 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // 사용자가 로그인했을 때 독서 기록 가져오기
  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchReadingLogs(userId);
    }
  }, [isLoggedIn, userId, fetchReadingLogs]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{flex:1}} edges={[ 'left', 'right']} >
              <NavigationContainer>
                <StatusBar barStyle="light-content" translucent={true}/>
                {isTabBarVisible && <TabBar/>}
                  <RootStack />
              </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}