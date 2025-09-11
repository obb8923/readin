import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from 'react';
import { AppTab } from "@nav/tab/App";
import { OnboardingStack } from "@nav/stack/Onboarding";
const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
 AppTab:undefined,
 Onboarding:undefined,
};
export const RootStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AppTab">
      <Stack.Screen name="AppTab" component={AppTab} />
      <Stack.Screen name="Onboarding" component={OnboardingStack} />
    </Stack.Navigator>
  );
};
