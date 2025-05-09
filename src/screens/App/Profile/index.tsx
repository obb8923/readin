import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../../nav/stack/App"; // 실제 경로에 맞게 조정 필요

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  "Home"
>;

const Profile = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Profile Screen</Text>
      <Button
        title="Go to Home"
        onPress={() => navigation.navigate("Home")}
      />
    </View>
  );
};

export default Profile;