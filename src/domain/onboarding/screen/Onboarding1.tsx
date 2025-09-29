import { View } from "react-native";
import { Text } from "@component/Text";
import { useNavigation } from "@react-navigation/native";
import { Background } from "@component/Background";
import { Button } from "@component/Button";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "@nav/stack/Onboarding";
import { BookHorizontal } from "@/shared/component/BookHorizontal";
export const demoBooks = [
  { id: '1', title: '코스모스', pages: 719, thickness: 12, height: 225, scale: 1 },
  { id: '2', title: '데일 카네기 인간관계론', pages: 256, thickness: 10, height: 225, scale: 1 },
  { id: '3', title: '세이노의 가르침', pages: 736, thickness: 14, height: 225, scale: 1 },
  { id: '4', title: '모순', pages: 307, thickness: 8, height: 225, scale: 1 },
  { id: '5', title: '프로젝트 헤일메리', pages: 692, thickness: 12, height: 225, scale: 1 },
  { id: '6', title: '인간 실격', pages: 192, thickness: 16, height: 225, scale: 1 },
  { id: '7', title: '사피엔스', pages: 636, thickness: 11, height: 225, scale: 1 },
  { id: '8', title: '데미안', pages: 248, thickness: 13, height: 225, scale: 1 },
];
export const Onboarding1Screen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();

  
  return (
    <Background>
      <View className="flex-1 w-full p-6 items-center justify-between">
        <View className="w-full flex-1">
          <View className="mb-4">
          <Text text="ReadIn에 오신 것을 환영해요" type="title1" className="text-white" />
          <Text text="나의 독서 기록을 쉽게 모으고, 한눈에 확인하세요." type="body2" className="text-gray300 mt-2" />
        </View>

          {/* 향후 일러스트/이미지 영역 */}
          <View className="w-full flex-1 rounded-2xl items-center justify-center">
            {demoBooks.map((book, idx) => (
              <BookHorizontal
                key={book.id}
                id={book.id}
                title={book.title}
                pages={book.pages}
                thickness={book.thickness}
                height={book.height}
                scale={book.scale}
                index={idx}
              />
            ))}
          </View>

        </View>
        {/* 아래쪽 버튼 영역 */}
          <View className="flex-row w-full h-12">
            <Button text="다음" onPress={() => navigation.navigate('Onboarding2')} className="bg-primary" textClassName="" />
          </View>
      </View>
    </Background>
  );
};