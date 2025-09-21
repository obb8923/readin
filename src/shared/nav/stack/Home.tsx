import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "@home/screen/HomeScreen";
import { BookSearchScreen } from "@home/screen/BookSearchScreen";
const Stack = createNativeStackNavigator<HomeStackParamList>();
export type HomeStackParamList = {
  Home:undefined,  
  BookSearch:undefined,
}

export const HomeStack = () => {
  return (
    <Stack.Navigator 
    screenOptions={{headerShown:false}}
    initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen}/>      
      <Stack.Screen name="BookSearch" component={BookSearchScreen}/>
    </Stack.Navigator>
  );
};