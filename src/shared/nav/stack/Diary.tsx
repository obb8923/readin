import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DiaryScreen } from "@diary/screen/DiaryScreen";

const Stack = createNativeStackNavigator<DiaryStackParamList>();
export type DiaryStackParamList = {
  Diary:undefined,  
}

export const DiaryStack = () => {
  return (
    <Stack.Navigator 
    screenOptions={{headerShown:false}}
    initialRouteName="Diary">
      <Stack.Screen name="Diary" component={DiaryScreen}/>      
    </Stack.Navigator>
  );
};