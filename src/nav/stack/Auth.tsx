import LogIn from "../../screens/Auth/LogIn"
import SignUp from "../../screens/Auth/SignUp";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<AuthStackParamList>();
export type AuthStackParamList = {
  LogIn:undefined,
  SignUp:undefined,
}
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
<Stack.Screen name="LogIn" component={LogIn} />
<Stack.Screen name="SignUp" component={SignUp} /> 
</Stack.Navigator>
  );
};

export default AuthStack;