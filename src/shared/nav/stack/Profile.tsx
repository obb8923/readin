import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileScreen } from "@profile/screen/ProfileScreen";
import { WebviewScreen } from "@profile/screen/WebviewScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();
export type ProfileStackParamList = {
  Profile: undefined;

  WebView: {
    url: string;
    title?: string;
  };
};

export const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      {/* <Stack.Screen name="UserInfo" component={UserInfoScreen} /> */}
    
      <Stack.Screen name="WebView" component={WebviewScreen} />
    </Stack.Navigator>
  );
};