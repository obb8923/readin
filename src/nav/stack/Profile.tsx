import Profile from "../../screens/App/Profile";
import TermsAndPolicies from "../../screens/App/Profile/TermsAndPolicies";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<ProfileStackParamList>();
export type ProfileStackParamList = {
  Profile:undefined,
  TermsAndPolicies:undefined,
}
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="TermsAndPolicies" component={TermsAndPolicies} />
</Stack.Navigator>
  );
};

export default ProfileStack;