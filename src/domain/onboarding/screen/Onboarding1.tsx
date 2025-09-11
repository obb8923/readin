import { View } from "react-native";
import { Text } from "@component/Text";
import { Button } from "@component/Button";
import { useFirstVisitStore } from "@store/firstVisitStore";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from "@nav/stack/Root";
import { Background } from "@component/Background";
export const Onboarding1Screen = () => {
  const { setFirstVisitCompleted, isLoading } = useFirstVisitStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleComplete = async () => {
    await setFirstVisitCompleted();
    navigation.reset({ index: 0, routes: [{ name: 'AppTab' }] });
  };

  return (
    <Background>
    <View>
      <Text text="Onboarding1" type="title1" className="text-white" />
      <Button text={isLoading ? '저장 중...' : '시작하기'} onPress={handleComplete} />
    </View>
    </Background>
  );
};