import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "@component/Text";
import { useFirstVisitStore } from "@store/firstVisitStore";
import { useFocusEffect } from "@react-navigation/native";
import { Background } from "@component/Background";
import { useHideTabBar} from "@store/tabStore";
import { Button } from "@component/Button";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "@nav/stack/Onboarding";
import { Dot } from "@domain/onboarding/component/Dot";
import ChevronLeft from "@assets/svgs/ChevronLeft.svg";
import { Colors } from "@/shared/constant/Colors";
import { DEVICE_WIDTH } from "@/shared/constant/normal";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
export const Onboarding3Screen = () => {
  const { setFirstVisitCompleted, isLoading } = useFirstVisitStore();
  const hideTabBar = useHideTabBar();
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  useFocusEffect(hideTabBar);

  const chartWidth = DEVICE_WIDTH - 32; // padding 16 + 16
  const chartHeight = 180;
  const BAR_MIN_COL_WIDTH = 40;
  const LINE_MIN_POINT_WIDTH = 40;

  const chartConfig = {
    backgroundColor: Colors.background,
    backgroundGradientFrom: Colors.background,
    backgroundGradientTo: Colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    fillShadowGradientFrom: Colors.primary,
    fillShadowGradientTo: Colors.primary,
    fillShadowGradientOpacity: 0.7,
    propsForBackgroundLines: {
      stroke: 'rgba(255,255,255,0.2)'
    },
  } as const;

  const exampleYearly = { labels: ['2022', '2023', '2024'], datasets: [{ data: [5, 8, 12] }] };
  const exampleMonthly = { labels: Array.from({ length: 12 }, (_, i) => String(i + 1)), datasets: [{ data: [0,2,1,3,2,4,5,3,2,4,6,5], color: () => Colors.primary }] };
  const exampleCategories = [
    { name: '문학', count: 5, color: Colors.kdc9, legendFontColor: Colors.white, legendFontSize: 12 },
    { name: '자연과학', count: 3, color: Colors.kdc5, legendFontColor: Colors.white, legendFontSize: 12 },
    { name: '사회과학', count: 2, color: Colors.kdc4, legendFontColor: Colors.white, legendFontSize: 12 },
    { name: '기타', count: 1, color: Colors.realblack, legendFontColor: Colors.white, legendFontSize: 12 },
  ];

  const barContentWidth = Math.max(chartWidth, exampleYearly.datasets[0].data.length * BAR_MIN_COL_WIDTH);
  const lineContentWidth = Math.max(chartWidth, 12 * LINE_MIN_POINT_WIDTH);

  return (
    <Background>
      <View className="flex-1 w-full p-6 items-center justify-between">
        <View className="w-full flex-1">
       
            <View className="mb-4">
          <Text text="통계로 독서 습관을 확인해요" type="title1" className="text-white" />
          <Text text="읽은 책 수, 점수, 기간별 추이를 확인할 수 있어요." type="body2" className="text-gray300 mt-2" />
        </View>

        <View className=" flex-1 rounded-2xl items-center justify-center">
          <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
            <View className="bg-gray800 rounded-2xl p-4 mb-4">
              <Text text="연도별 독서 현황" type="title3" className="text-white mb-2" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false} className="mt-1">
                <View className="rounded-xl overflow-hidden">
                  <BarChart
                    width={barContentWidth}
                    height={chartHeight}
                    data={exampleYearly}
                    fromZero
                    showValuesOnTopOfBars
                    yAxisLabel=""
                    yAxisSuffix="권"
                    segments={4}
                    chartConfig={chartConfig}
                  />
                </View>
              </ScrollView>
            </View>

            <View className="bg-gray800 rounded-2xl p-4 mb-4">
              <Text text="월별 독서 추이" type="title3" className="text-white mb-2" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false} className="mt-1">
                <View className="rounded-xl overflow-hidden">
                  <LineChart
                    width={lineContentWidth}
                    height={chartHeight}
                    data={exampleMonthly}
                    withInnerLines
                    bezier
                    fromZero
                    yAxisLabel=""
                    yAxisSuffix="권"
                    segments={4}
                    chartConfig={chartConfig}
                  />
                </View>
              </ScrollView>
            </View>

            <View className="bg-gray800 rounded-2xl p-4">
              <Text text="카테고리별 비율" type="title3" className="text-white mb-2" />
              <View className="mt-3 rounded-xl overflow-hidden">
                <PieChart
                  width={chartWidth}
                  height={chartHeight}
                  accessor={'count'}
                  backgroundColor={'transparent'}
                  paddingLeft={'0'}
                  chartConfig={chartConfig}
                  data={exampleCategories}
                />
              </View>
            </View>
          </ScrollView>
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
          <Button 
            text={isLoading ? '시작하는 중...' : '시작하기'} 
            onPress={setFirstVisitCompleted} 
            className="bg-primary"
            isLoading={isLoading}
          />
          </View>
      </View>
    </Background>
  );
};


