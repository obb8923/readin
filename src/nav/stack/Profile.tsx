
import Profile from "../../screens/App/Profile";
import TermsAndPolicies from "../../screens/App/Profile/TermsAndPolicies";
import StatisticsScreen from "../../screens/App/Profile/Statistics";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<ProfileStackParamList>();
export type ProfileStackParamList = {
  Profile:undefined,
  TermsAndPolicies:undefined,
  Statistics: undefined;
}

const ProfileStack = () => { 
  return (
    <Stack.Navigator>
            <Stack.Screen name="Profile" component={Profile} options={{headerShown:false}}/>
            <Stack.Screen name="TermsAndPolicies" component={TermsAndPolicies} options={{title:'약관 및 정책'}}/>
            <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ title: '독서 통계' }} />
</Stack.Navigator>
  );
};

export default ProfileStack;