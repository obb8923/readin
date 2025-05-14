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
    <Stack.Navigator >
            <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}}/>
            <Stack.Screen name="BookSearch" component={BookSearchScreen} options={{title:'책 검색'}}/>
</Stack.Navigator>
  );
};

export default HomeStack;