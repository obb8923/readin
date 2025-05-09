import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";

import AppStack, { AppStackParamList } from "./App";
import AuthStack, { AuthStackParamList } from "./Auth";
import { View, Text } from "react-native";
const Stack = createNativeStackNavigator<RootStackParamList>();
export type RootStackParamList = {
  A:undefined,
  AuthStack: NavigatorScreenParams<AuthStackParamList>,
  AppStack: NavigatorScreenParams<AppStackParamList>,
};

const RootStack = () => {
  return (
    <Stack.Navigator initialRouteName="AuthStack" screenOptions={{headerShown:false}}>
      <Stack.Screen name="AuthStack" component={AuthStack} />
      <Stack.Screen name="AppStack" component={AppStack} />
    </Stack.Navigator>
  );
};

export default RootStack;
