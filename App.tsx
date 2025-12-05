import "./global.css"
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {RootStack} from '@nav/stack/Root';
import { TabBar } from '@component/TabBar';
import { useIsTabBarVisible } from '@store/tabStore';
import { useFirstVisitStore } from "@store/firstVisitStore";
import { useAppInitStore } from '@store/appInitStore';
import { OnboardingStack } from "@nav/stack/Onboarding";

export default function App() {
  const isTabBarVisible = useIsTabBarVisible();
  const { isFirstVisit } = useFirstVisitStore();
  const { initializeApp } = useAppInitStore();

  // 앱 시작 시 모든 초기화 로직 실행
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);
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