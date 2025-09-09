import "./global.css"
import React from 'react';
import { StatusBar} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {RootStack} from './src/shared/nav/stack/Root';
import { TabBar } from './src/shared/component/TabBar';
import { useIsTabBarVisible } from './src/shared/store/tabStore';
export default function App() {
  const isTabBarVisible = useIsTabBarVisible();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{flex:1}} edges={[ 'left', 'right']} >
              <NavigationContainer>
                <StatusBar barStyle="dark-content" translucent={true}/>
                {isTabBarVisible && <TabBar/>}
                <RootStack/>
              </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}