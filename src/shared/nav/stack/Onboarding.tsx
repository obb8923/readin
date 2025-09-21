import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Onboarding1Screen } from "@domain/onboarding/screen/Onboarding1";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export type OnboardingStackParamList = {
 Onboarding1:undefined,

};

export const OnboardingStack = () => {
    return (
        <Stack.Navigator 
        screenOptions={{headerShown:false}}
        initialRouteName="Onboarding1">

            <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />

        </Stack.Navigator>  
    )
}
