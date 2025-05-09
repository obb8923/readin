import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";
import AppTab from "../tab/App";
import AuthStack, { AuthStackParamList } from "./Auth";
const Stack = createNativeStackNavigator<RootStackParamList>();
export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>,
  AppTab:undefined,
};

const RootStack = () => {
  return (
    <Stack.Navigator initialRouteName="AuthStack" screenOptions={{headerShown:false}}>
      <Stack.Screen name="AuthStack" component={AuthStack} />
      <Stack.Screen name="AppTab" component={AppTab} />
    </Stack.Navigator>
  );
};

export default RootStack;
