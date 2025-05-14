import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { useLayoutEffect } from "react";
import Profile from "../../screens/App/Profile";
import TermsAndPolicies from "../../screens/App/Profile/TermsAndPolicies";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TabNavOptions } from "../tab/App";
const Stack = createNativeStackNavigator<ProfileStackParamList>();
export type ProfileStackParamList = {
  Profile:undefined,
  TermsAndPolicies:undefined,
}

const ProfileStack = () => { 
  return (
    <Stack.Navigator>
            <Stack.Screen name="Profile" component={Profile} options={{headerShown:false}}/>
            <Stack.Screen name="TermsAndPolicies" component={TermsAndPolicies} options={{title:'약관 및 정책'}}/>
</Stack.Navigator>
  );
};

export default ProfileStack;