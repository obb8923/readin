import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";
import AppTab from "../tab/App";
import AuthStack, { AuthStackParamList } from "./Auth";
import { useAuthStore } from "../../store/authStore";
import { ActivityIndicator, View } from "react-native";

const Stack = createNativeStackNavigator<RootStackParamList>();
export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>,
  AppTab:undefined,
};

const RootStack = () => {
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const checkSession = useAuthStore((state) => state.checkSession);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      {session ? (
        <Stack.Screen name="AppTab" component={AppTab} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default RootStack;
