import "./global.css"
import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {RootStack} from './src/shared/nav/stack/Root';
import { TabBar } from './src/shared/component/TabBar';
import { useIsTabBarVisible } from './src/shared/store/tabStore';
import { useFirstVisitStore } from '@store/firstVisitStore';
import { useAuthStore } from '@store/authStore';
import { useFetchReadingLogs } from '@store/readingLogsWithBooksStore';
import { OnboardingStack } from '@nav/stack/Onboarding';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SUPABASE_WEB_CLIENT_KEY, SUPABASE_IOS_CLIENT_KEY } from '@env';

export default function App() {
  const isTabBarVisible = useIsTabBarVisible();
  const { isFirstVisit, isLoading, checkFirstVisit } = useFirstVisitStore();
  const { isLoggedIn, userId } = useAuthStore();
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
  
  useEffect(() => {
    checkFirstVisit();
  }, [checkFirstVisit]);

  // 사용자가 로그인했을 때 독서 기록 가져오기
  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchReadingLogs(userId);
    }
  }, [isLoggedIn, userId, fetchReadingLogs]);

  const showTabBar = !isLoading && !isFirstVisit && isTabBarVisible;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{flex:1}} edges={[ 'left', 'right']} >
              <NavigationContainer>
                <StatusBar barStyle="dark-content" translucent={true}/>
                {showTabBar && <TabBar/>}
                {isLoading ? (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                  </View>
                ) : isFirstVisit ? (
                  <OnboardingStack />
                ) : (
                  <RootStack />
                )}
              </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}