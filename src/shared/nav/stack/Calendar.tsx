import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {CalendarScreen} from "@calendar/screen/CalendarScreen";

const Stack = createNativeStackNavigator<CalendarStackParamList>();
export type CalendarStackParamList = {
  Calendar:undefined,

}

export const CalendarStack = () => {
  return (
    <Stack.Navigator >
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{headerShown:false}}/>
    </Stack.Navigator>
  );
};