import { View } from "react-native";
import { Background } from '@/shared/component/Background';
import { Text } from '@/shared/component/Text';
export const BooksScreen = () => {
  return (
    <Background isTabBarGap={true}>
       {/* 헤더 */}
       <View className="px-6 py-4">
          <Text text="Books" type="title1" className="text-white" />
        </View>
    </Background>
  );
};