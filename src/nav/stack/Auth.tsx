import LogIn from "../../screens/Auth/LogIn"
import SignUp from "../../screens/Auth/SignUp";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<AuthStackParamList>();
export type AuthStackParamList = {
  LogIn: undefined,
  SignUp: undefined,
}

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="LogIn" 
        component={LogIn} 
        options={{headerShown:false}}
      />
      <Stack.Screen name="SignUp" component={SignUp} options={{title:'회원가입'}}/> 
    </Stack.Navigator>
  );
};

export default AuthStack;