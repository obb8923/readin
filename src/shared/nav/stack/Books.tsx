import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {BooksScreen} from "@books/screen/BooksScreen";

const Stack = createNativeStackNavigator<BooksStackParamList>();
export type BooksStackParamList = {
  Books:undefined,

}

export const BooksStack = () => {
  return (
    <Stack.Navigator >
      <Stack.Screen name="Books" component={BooksScreen} options={{headerShown:false}}/>
    </Stack.Navigator>
  );
};