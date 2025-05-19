import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import useReviewStore from '../../../../store/reviewStore';
import Background from '../../../../components/Background';
import { ProfileStackParamList } from '../../../../nav/stack/Profile';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

type StatisticsScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Statistics'>;

export default function StatisticsScreen({ navigation }: StatisticsScreenProps) {
  const { getGroupedReviews, reviews } = useReviewStore();
  const groupedMonthlyReviews = getGroupedReviews();

  const monthlyStats = groupedMonthlyReviews
    .filter(section => section.title !== "완독일 미지정")
    .map(section => ({
      month: section.title.replace('년 ', '-').replace('월', ''),
      count: section.data.length,
    }))
    .sort((a, b) => {
        const [aYear, aMonth] = a.month.split('-').map(Number);
        const [bYear, bMonth] = b.month.split('-').map(Number);
        if (aYear !== bYear) return aYear - bYear;
        return aMonth - bMonth;
    });

  const monthlyChartData = {
    labels: monthlyStats.map(stat => stat.month.substring(2)),
    datasets: [{ data: monthlyStats.map(stat => stat.count) }],
  };

  const yearlyAggregatedStats: { [year: string]: number } = {};
  reviews
    .filter(review => review.end_date)
    .forEach(review => {
      try {
        const year = new Date(review.end_date!).getUTCFullYear().toString();
        yearlyAggregatedStats[year] = (yearlyAggregatedStats[year] || 0) + 1;
      } catch (e) {
        console.error("연간 통계 집계 중 날짜 오류:", review.id, review.end_date, e);
      }
    });

  const yearlyStats = Object.keys(yearlyAggregatedStats)
    .map(year => ({
      year: year,
      count: yearlyAggregatedStats[year],
    }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  const yearlyChartData = {
    labels: yearlyStats.map(stat => stat.year),
    datasets: [{ data: yearlyStats.map(stat => stat.count) }],
  };

  const commonChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '0', strokeWidth: '0' },
    barPercentage: 0.7,
  };
  
  const monthlyChartConfig = {
    ...commonChartConfig,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  };

  const yearlyChartConfig = {
    ...commonChartConfig,
    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
  };

  return (
    <Background style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}>
        <Text className="text-xl font-bold mb-3 text-center text-gray-800">월별 독서량</Text>
        {monthlyStats.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
            <BarChart
              style={{ marginVertical: 8, borderRadius: 16 }}
              data={monthlyChartData}
              width={Math.max(screenWidth - 40, monthlyStats.length * 55)}
              height={220}
              yAxisLabel=""
              yAxisSuffix="권"
              chartConfig={monthlyChartConfig}
              verticalLabelRotation={0}
              fromZero
              showValuesOnTopOfBars
              segments={Math.max(...monthlyStats.map(s => s.count)) <= 5 ? Math.max(...monthlyStats.map(s => s.count)) : 4}
            />
          </ScrollView>
        ) : (
          <Text className="text-base text-center mt-4 mb-8 text-gray-600">표시할 월별 데이터가 없습니다.</Text>
        )}

        <Text className="text-xl font-bold mb-3 text-center text-gray-800">연간 독서량</Text>
        {yearlyStats.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              style={{ marginVertical: 8, borderRadius: 16 }}
              data={yearlyChartData}
              width={Math.max(screenWidth - 40, yearlyStats.length * 70)}
              height={220}
              yAxisLabel=""
              yAxisSuffix="권"
              chartConfig={yearlyChartConfig}
              fromZero
              showValuesOnTopOfBars
              segments={Math.max(...yearlyStats.map(s => s.count)) <= 5 ? Math.max(...yearlyStats.map(s => s.count)) : 4}
            />
          </ScrollView>
        ) : (
          <Text className="text-base text-center mt-4 text-gray-600">표시할 연간 데이터가 없습니다.</Text>
        )}
      </ScrollView>
    </Background>
  );
} 