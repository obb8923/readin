import BookcaseScreen from "../../screens/App/Bookcase";
import BookSearchScreen from "../../screens/App/Bookcase/BookSearch";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<BookcaseStackParamList>();
export type BookcaseStackParamList = {
  Bookcase:undefined,
  BookSearch:undefined,
}
const BookcaseStack = () => {
  return (
    <Stack.Navigator >
            <Stack.Screen name="Bookcase" component={BookcaseScreen} options={{headerShown:false}}/>
            <Stack.Screen name="BookSearch" component={BookSearchScreen} options={{title:'책 검색'}}/>
</Stack.Navigator>
  );
};

export default BookcaseStack;