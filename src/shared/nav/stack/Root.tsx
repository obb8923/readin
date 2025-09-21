import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from 'react';
import { AppTab } from "@nav/tab/App";
const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
 AppTab:undefined,
};
export const RootStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AppTab">
      <Stack.Screen name="AppTab" component={AppTab} />
    </Stack.Navigator>
  );
};
