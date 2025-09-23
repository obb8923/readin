import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Onboarding1Screen } from "@domain/onboarding/screen/Onboarding1";
import { Onboarding2Screen } from "@domain/onboarding/screen/Onboarding2";
import { Onboarding3Screen } from "@domain/onboarding/screen/Onboarding3";
import { useFocusEffect } from "@react-navigation/native";
import { useHideTabBar } from "@store/tabStore";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export type OnboardingStackParamList = {
 Onboarding1: undefined,
 Onboarding2: undefined,
 Onboarding3: undefined,

};

export const OnboardingStack = () => {
    const hideTabBar = useHideTabBar();
    
    // 온보딩 스택이 마운트될 때 탭바 숨기기
    useFocusEffect(hideTabBar);
    
    return (
        <Stack.Navigator 
        screenOptions={{headerShown:false}}
        initialRouteName="Onboarding1">

            <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
            <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
            <Stack.Screen name="Onboarding3" component={Onboarding3Screen} />

        </Stack.Navigator>  
    )
}
