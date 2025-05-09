import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../../screens/App/Home";
import Profile from "../../screens/App/Profile";
const Stack = createNativeStackNavigator<AppStackParamList>();
export type AppStackParamList = {
  Home:undefined,
  Profile:undefined,
}
const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
};

export default AppStack;



