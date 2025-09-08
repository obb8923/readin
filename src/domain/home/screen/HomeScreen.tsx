import { View } from 'react-native';
import { Background } from '@/shared/component/Background';
import { Text } from '@/shared/component/Text';
import { SearchBar } from '@/shared/component/SearchBar';
export const HomeScreen = () => {
  return (
    <Background>
      {/* 검색 바 */}
      <View className="w-full px-4 mt-2">
        <SearchBar placeholder="검색어를 입력하세요" />
      </View>
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