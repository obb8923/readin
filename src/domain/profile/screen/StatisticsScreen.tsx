import {Background} from '@component/Background';
import {ScrollView, View} from 'react-native';
import {Text} from '@component/Text';
import {AppBar} from '@component/AppBar';
import {useTabStore} from '@store/tabStore';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from '@nav/stack/Profile';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import React, { useMemo } from 'react';
import { useIsReadingLogsLoading, useReadingLogs } from '@store/readingLogsWithBooksStore';
// import { ReadingLogWithBook } from '@libs/supabase/reading_logs';
import {Colors} from '@constant/Colors';
import {DEVICE_WIDTH} from '@constant/normal';
type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export const StatisticsScreen = () => {
  const { showTabBar } = useTabStore();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const readingLogs = useReadingLogs();
  const isLoading = useIsReadingLogsLoading();

  const getEffectiveDate = (isoOrNull?: string | null, fallback?: string) => {
    if (isoOrNull) return new Date(isoOrNull);
    if (fallback) return new Date(fallback);
    return null;
  };

  const kdcToCategoryName = (kdc: string | null) => {
    if (!kdc || kdc.length === 0) return '기타';
    const first = kdc[0];
    switch (first) {
      case '0':
        return '총류';
      case '1':
        return '철학';
      case '2':
        return '종교';
      case '3':
        return '사회과학';
      case '4':
        return '자연과학';
      case '5':
        return '기술,과학';
      case '6':
        return '예술';
      case '7':
        return '언어';
      case '8':
        return '문학';
      case '9':
        return '역사';
      default:
        return '총류';
    }
  };

  const colorByCategory: Record<string, string> = {
    총류: Colors.kdc1,
    철학: Colors.kdc2,
    종교: Colors.kdc3,
    사회과학: Colors.kdc4,
    자연과학: Colors.kdc5,
    "기술,과학": Colors.kdc6,
    예술: Colors.kdc7,
    언어: Colors.kdc8,
    문학: Colors.kdc9,
    역사: Colors.kdc10,
    기타: Colors.realblack,
  };

  const { yearlyData, monthlyData, categoryData } = useMemo(() => {
    const sourceLogs = readingLogs;

    // 연도별 집계
    const yearCount: Record<string, number> = {};
    for (const log of sourceLogs) {
      const d = getEffectiveDate(log.finished_at, log.created_at);
      if (!d || isNaN(d.getTime())) continue;
      const y = String(d.getFullYear());
      yearCount[y] = (yearCount[y] ?? 0) + 1;
    }
    const yearlyPairs = Object.entries(yearCount)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year);

    // 월별 집계 (올해 기준)
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthCount = Array.from({ length: 12 }, () => 0);
    for (const log of sourceLogs) {
      const d = getEffectiveDate(log.finished_at, log.created_at);
      if (!d || isNaN(d.getTime())) continue;
      if (d.getFullYear() !== currentYear) continue;
      const m = d.getMonth(); // 0-11
      monthCount[m] += 1;
    }

    // 카테고리 집계 (KDC 첫자리 기준)
    const catCount: Record<string, number> = {};
    for (const log of sourceLogs) {
      const cat = kdcToCategoryName(log.book?.kdc ?? null);
      catCount[cat] = (catCount[cat] ?? 0) + 1;
    }
    const catEntries = Object.entries(catCount).map(([name, count]) => ({ name, count }));
    catEntries.sort((a, b) => b.count - a.count);
    const top = catEntries.slice(0, 5);
    const rest = catEntries.slice(5);
    const othersSum = rest.reduce((acc, c) => acc + c.count, 0);
    const finalCats = othersSum > 0
      ? [...top, { name: '기타', count: othersSum }]
      : top;

    return {
      yearlyData: yearlyPairs,
      monthlyData: monthCount,
      categoryData: finalCats,
    };
  }, [readingLogs]);

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
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
    propsForBackgroundLines: {
      stroke: 'rgba(255,255,255,0.2)'
    },
  } as const;

  const chartWidth = DEVICE_WIDTH - 32; // padding 16 + 16
  const chartHeight = 220;
  const BAR_MIN_COL_WIDTH = 40;
  const LINE_MIN_POINT_WIDTH = 40;
  const barContentWidth = Math.max(chartWidth, (yearlyData.length > 0 ? yearlyData.length : 1) * BAR_MIN_COL_WIDTH);
  const lineContentWidth = Math.max(chartWidth, 12 * LINE_MIN_POINT_WIDTH);

  return (
    <Background>
        <AppBar
          title="독서 통계"
          onLeftPress={() => {
            showTabBar();
            navigation.goBack();
          }}
        />
        <ScrollView className="bg-background">
          <View className="py-6">
          <View className="bg-gray800 p-4 mb-4">
            <Text text="연도별 독서 현황" type="title3" className="text-white mb-1" />
            <Text text="한 해 동안 얼마나 많은 책을 읽었는지 확인할 수 있어요." type="caption1" className="text-gray400" />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false} className="mt-3">
              <View className="rounded-xl overflow-hidden">
                <BarChart
                  width={barContentWidth}
                  height={chartHeight}
                  data={{
                    labels: yearlyData.length > 0 ? yearlyData.map(y => String(y.year)) : ['—'],
                    datasets: [{ data: yearlyData.length > 0 ? yearlyData.map(y => y.count) : [0] }],
                  }}
                  fromZero
                  showValuesOnTopOfBars
                  yAxisLabel=""
                  yAxisSuffix="권"
                  chartConfig={chartConfig}
                />
              </View>
            </ScrollView>
          </View>

          <View className="bg-gray800 p-4 mb-4">
            <Text text="월별 독서 현황" type="title3" className="text-white mb-1" />
            <Text text="월별 독서 패턴과 활동량을 확인할 수 있어요." type="caption1" className="text-gray400" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false} className="mt-3">
              <View className="rounded-xl overflow-hidden">
                <LineChart
                  width={lineContentWidth}
                  height={chartHeight}
                  data={{
                    labels: Array.from({ length: 12 }, (_, i) => String(i + 1)),
                    datasets: [{ data: monthlyData, color: () => Colors.primary }],
                  }}
                  withInnerLines
                  bezier
                  fromZero
                  yAxisLabel=""
                  yAxisSuffix="권"
                  chartConfig={chartConfig}
                />
              </View>
            </ScrollView>
          </View>

          <View className="bg-gray800 p-4 mb-4">
            <Text text="카테고리별 비율" type="title3" className="text-white" />
            <Text text="내 독서 취향이 어느 분야에 몰려 있는지 확인할 수 있어요." type="caption1" className="text-gray400" />

            <View className="mt-3 rounded-xl overflow-hidden">
              <PieChart
                width={chartWidth}
                height={chartHeight}
                accessor={'count'}
                backgroundColor={'transparent'}
                paddingLeft={'0'}
                chartConfig={chartConfig}
                data={(categoryData.length > 0 ? categoryData : [{ name: '기타', count: 1 }]).map(c => ({
                  name: c.name,
                  count: c.count,
                  color: colorByCategory[c.name] ?? Colors.gray400,
                  legendFontColor: Colors.white,
                  legendFontSize: 12,
                }))}
              />
            </View>
          </View>
          </View>
        </ScrollView>
    </Background>
  );
};

// removed StyleSheet in favor of Tailwind className