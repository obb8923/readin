import { NavigationContainer } from "@react-navigation/native";
import RootStack from "./src/nav/stack/Root";
import "./global.css"
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { SafeAreaView} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App(): React.JSX.Element {
  useEffect(() => {
    useAuthStore.getState().checkSession();
  }, []);

  return (
    <GestureHandlerRootView style={{flex:1}}>
      <SafeAreaView style={{flex:1}}>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default App;
