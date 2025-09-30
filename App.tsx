import "./global.css"
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {RootStack} from '@nav/stack/Root';
import { TabBar } from '@component/TabBar';
import { useIsTabBarVisible } from '@store/tabStore';
import { useAuthStore } from '@store/authStore';
import { useFetchReadingLogs } from '@store/readingLogsWithBooksStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SUPABASE_WEB_CLIENT_KEY, SUPABASE_IOS_CLIENT_KEY } from '@env';
import { useFirstVisitStore } from "@store/firstVisitStore";
import { OnboardingStack } from "@nav/stack/Onboarding";

export default function App() {
  const isTabBarVisible = useIsTabBarVisible();
  const { isLoggedIn, userId, checkLoginStatus } = useAuthStore();
  const fetchReadingLogs = useFetchReadingLogs();
  const { isFirstVisit, checkFirstVisit } = useFirstVisitStore();
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
useEffect(() => {
  checkFirstVisit();
}, [checkFirstVisit]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{flex:1}} edges={[ 'left', 'right']} >
              <NavigationContainer>
                <StatusBar barStyle="light-content" translucent={true}/>
                {isTabBarVisible && <TabBar/>}
                {!isFirstVisit&&<RootStack />}
                {isFirstVisit && <OnboardingStack />}
              </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}