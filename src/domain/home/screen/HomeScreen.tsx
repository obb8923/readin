import { View } from 'react-native';
import { Background } from '@/shared/components/Background';
import { Text } from '@/shared/components/Text';
export const HomeScreen = () => {
  return (
    <Background>
      {/* 검색 바 */}
      <View></View>
      <Text text="Title1" type="title1"/>
      <Text text="Title2" type="title2"/>
      <Text text="Title3" type="title3"/>
      <Text text="Title4" type="title4"/>
      <Text text="Body1" type="body1"/>
      <Text text="Body2" type="body2"/>
      <Text text="Body3" type="body3"/>
      <Text text="Caption1" type="caption1"/>
      <Text text="Handwriting" type="handwriting"/>
    </Background>
  );
};