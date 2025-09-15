import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileScreen } from "@profile/screen/ProfileScreen";
import { WebviewScreen } from "@profile/screen/WebviewScreen";
import { MyInfoScreen } from "@/domain/profile/screen/MyInfoScreen";
import { StatisticsScreen } from "@/domain/profile/screen/StatisticsScreen";
const Stack = createNativeStackNavigator<ProfileStackParamList>();
export type ProfileStackParamList = {
  Profile: undefined;

  Webview: {
    url: string;
    title?: string;
  };
  MyInfo: undefined;
  Statistics: undefined;
};

export const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="MyInfo" component={MyInfoScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
    
      <Stack.Screen name="Webview" component={WebviewScreen} />
    </Stack.Navigator>
  );
};