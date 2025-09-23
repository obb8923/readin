import { TouchableOpacity, View, Image } from "react-native";
import { Text } from "@component/Text";
import { useFirstVisitStore } from "@store/firstVisitStore";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Background } from "@component/Background";
import { useHideTabBar} from "@store/tabStore";
import { Button } from "@component/Button";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "@nav/stack/Onboarding";
import { Colors } from "@/shared/constant/Colors";
import ChevronLeft from "@assets/svgs/ChevronLeft.svg";
import RNHorizontalSlider from "@/shared/component/Slider";
import React from 'react';
export const Onboarding2Screen = () => {
  const hideTabBar = useHideTabBar();
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const [sliderWidth, setSliderWidth] = React.useState(0);
  const [rating, setRating] = React.useState(100);
  const formatDate = (date: Date) => {
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  };
  const todayFormatted = React.useMemo(() => formatDate(new Date()), []);
    
  useFocusEffect(hideTabBar);

  return (
    <Background>
      <View className="flex-1 w-full p-6 items-center justify-between">
        {/* 위쪽 영역 */}
        <View className="w-full flex-1">
       
        <View className="mb-4">
          <Text text="책을 등록하고 기록하세요" type="title1" className="text-white" />
          <Text text="터치 한 번으로 간단하게 기록할 수 있어요." type="body2" className="text-gray300 mt-2" />
        </View>

          <View className="flex-1 rounded-2xl items-center justify-center">
            {/* 내부 */}
          <View className="bg-gray800 rounded-2xl px-6 pt-8 w-full">
          {/* 책 정보 섹션 */}
          <View className="flex-row mb-6">
            {/* 왼쪽 이미지 */}

            <Image 
              source={require('@assets/cosmos.webp')}
              className="w-20 h-28 rounded-md mr-4"
              resizeMode="cover"
            />
            {/* 오른쪽 책 정보 */}
            <View className="flex-1">
              <Text 
                text={"코스모스"} 
                type="body1" 
                className="text-white mb-2" 
                numberOfLines={2}
              />
              <Text 
                text={"칼 세이건"} 
                type="body3" 
                className="text-gray300 mb-1" 
                numberOfLines={1}
              />
              <Text 
                text={"사이언스북스"} 
                type="caption1" 
                className="text-gray400" 
                numberOfLines={1}
              />
            </View>
          </View>
          
          {/* Rating 섹션 */}
          <View 
            className="mb-6 w-full"
            onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
          >
            <View className="flex-row justify-between items-center">
            <Text text="평점" type="body2" className="text-white mb-3" />
                 <Text 
                 text={`중간 점수는 57점 입니다.`} 
                 type="caption1" 
                 className="text-gray300 mr-2 mb-2" 
               />              
            </View>
            <View className="flex-row items-center relative justify-center items-center">
              <RNHorizontalSlider
                width={sliderWidth}
                height={36}
                value={rating}
                onChange={(value) => {setRating(value)}}
                onComplete={(value) => {setRating(value)}}
              />
              <View pointerEvents="none" className="absolute left-4 justify-center items-center">
                <Text text={`${rating}점`} type="body3" className="text-gray100 font-bold" />
              </View>
            </View>
          </View>

          {/* 날짜 섹션 */}
          <View className="w-full mb-6">
            <Text text="독서 기간" type="body2" className="text-white mb-3" />
            <View className="w-full flex-row items-center justify-around">
              {/* 읽기 시작 날짜 */}
              <TouchableOpacity 
                onPress={() => {}}
                className="bg-gray700 rounded-lg p-3 flex-1"
                activeOpacity={0.8}
              >
                <Text 
                  text={todayFormatted} 
                  type="body3" 
                  className={"text-white" } 
                />
              </TouchableOpacity>

              <Text text="부터" type="body3" className="text-gray300 px-2" />
              {/* 읽기 완료 날짜 */}
              <TouchableOpacity 
                onPress={() => {}}
                className="bg-gray700 rounded-lg p-3 flex-1"
                activeOpacity={0.8}
              >
                <Text 
                  text={todayFormatted} 
                  type="body3" 
                  className={"text-white" } 
                />
              </TouchableOpacity>
              <Text text="까지" type="body3" className="text-gray300 px-2" />
            </View>
            
          
          </View>

          {/* 메모 섹션 */}
          <View className="mb-8">
            <Text text="메모" type="body2" className="text-white mb-3" />
            <TouchableOpacity
              onPress={() => { }}
              activeOpacity={0.8}
              className="bg-gray700 rounded-lg p-3"
            >
            
                <Text
                  text="짧은 감상평을 남겨보세요 (선택)"
                  type="body3"
                  className="text-gray400"
                  numberOfLines={1}
                />
            </TouchableOpacity>
          </View>

        </View>
          </View>
        </View>
        {/* 아래쪽 버튼 영역 */}
          <View className="flex-row w-full h-12 gap-x-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-12 h-12 rounded-xl px-4 py-2 justify-center items-center bg-gray800"
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="뒤로가기"
            >
            <ChevronLeft width={20} height={20} color={Colors.white} />
            </TouchableOpacity> 
            <Button text="다음" onPress={() => navigation.navigate('Onboarding3')} className="bg-primary" textClassName="" />
          </View>
      </View>
    </Background>
  );
};


