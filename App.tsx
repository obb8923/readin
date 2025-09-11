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
import { OnboardingStack } from '@nav/stack/Onboarding';
export default function App() {
  const isTabBarVisible = useIsTabBarVisible();
  const { isFirstVisit, isLoading, checkFirstVisit } = useFirstVisitStore();

  useEffect(() => {
    checkFirstVisit();
  }, [checkFirstVisit]);

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