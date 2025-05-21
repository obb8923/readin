import { NavigationContainer } from "@react-navigation/native";
import RootStack from "./src/nav/stack/Root";
import "./global.css"
import { useEffect } from 'react';
import { useAuthStore } from './src/store/authStore';
import { SafeAreaView} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import Colors from './src/constants/Colors';
import SnackBar from "./src/components/SnackBar";
import Modal from "./src/components/Modal";

function App(): React.JSX.Element {
  useEffect(() => {
    useAuthStore.getState().checkSession();
  }, []);

  return (
    <GestureHandlerRootView style={{flex:1}}>
      <SafeAreaView style={{flex:1}}>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.brick} translucent={false} />
          <RootStack />
          <Modal />
          <SnackBar />
        </NavigationContainer>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default App;
