import { View } from "react-native";
import { Text } from "@component/Text";
import { Background } from "@/shared/component/Background";
import { AppBar } from "@/shared/component/AppBar";
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "@nav/stack/Home";
import { type NativeStackNavigationProp } from "@react-navigation/native-stack";
export const BookSearchScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  return (
    <Background>
        <AppBar 
        title="책 검색" 
        onLeftPress={() => navigation.goBack()}
        onRightPress={() => navigation.goBack()}
        />
      <Text text="책을 검색해서 책장에 추가해보세요." type="body1" className="text-white" />
    </Background>
  );
};