import HomeScreen from "../../screens/App/Home";
import BookSearchScreen from "../../screens/App/Home/BookSearch";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<HomeStackParamList>();
export type HomeStackParamList = {
  Home:undefined,
  BookSearch:undefined,
}
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="BookSearch" component={BookSearchScreen} />
</Stack.Navigator>
  );
};

export default HomeStack;