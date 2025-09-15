import {Background} from '@component/Background';
import {View} from 'react-native';
import {Text} from '@component/Text';
import {AppBar} from '@component/AppBar';
import {useTabStore} from '@store/tabStore';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from '@nav/stack/Profile';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export const StatisticsScreen = () => {
  const { showTabBar } = useTabStore();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  return (
    <Background>
      <View>
        <AppBar
          title="Statistics"
          onLeftPress={() => {
            showTabBar();
            navigation.goBack();
          }}
        />
        <Text text="StatisticsScreen" type="title1" className="text-white" />
      </View>
    </Background>
  );
};