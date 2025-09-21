import React from 'react';
import { View, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Text } from './Text';
import { Colors } from '../constant/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ScoreStats {
  count: number;
  average: number;
  median: number;
  min: number;
  max: number;
  distribution: Record<string, number>;
  medianBook: { title: string; author: string[] } | null;
  minBook: { title: string; author: string[] } | null;
  maxBook: { title: string; author: string[] } | null;
}

interface ScoreStatsModalProps {
  visible: boolean;
  onClose: () => void;
  stats: ScoreStats;
}

export const ScoreStatsModal = ({ visible, onClose, stats }: ScoreStatsModalProps) => {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;

  const prepareChartData = () => {
    const distribution = stats.distribution;
    
    // 모든 가능한 구간을 정의하고 순서대로 정렬
    const allRanges = [
      '0-9', '10-19', '20-29', '30-39', '40-49', 
      '50-59', '60-69', '70-79', '80-89', '90-99', '100'
    ];
    
    // 실제 데이터가 있는 구간만 필터링하고 정렬된 순서 유지
    const sortedKeys = allRanges.filter(range => distribution.hasOwnProperty(range));
    
    const labels = sortedKeys.map(key => {
      if (key === '100') return '100';
      return key.split('-')[0];
    });
    
    const data = sortedKeys.map(key => distribution[key] || 0);
    
    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(251, 85, 49, ${opacity})`, // Colors.primary
        }
      ]
    };
  };

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
    barPercentage: 0.7,
  } as const;

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80" style={{ paddingTop: insets.top }}>
        <View className="flex-1" />
        
        {/* 모달 컨테이너 */}
        <View 
          className="bg-gray800 rounded-t-2xl px-6 pt-8" 
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          {/* 헤더 */}
          <View className="flex-row justify-between items-center mb-6">
            <Text text="점수 통계" type="title3" className="text-white" />
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray700 rounded-full p-2"
              activeOpacity={0.8}
            >
              <Text text="닫기" type="body2" className="text-white" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 기본 통계 */}
            <View className="mb-6">
              <Text text="기본 통계" type="body2" className="text-white mb-4" />
              <View className="bg-gray700 rounded-lg p-4">
                <View className="flex-row justify-between mb-3">
                  <Text text="총 평가한 책" type="body3" className="text-gray300" />
                  <Text text={`${stats.count}권`} type="body3" className="text-white font-bold" />
                </View>
                <View className="flex-row justify-between">
                  <Text text="평균 점수" type="body3" className="text-gray300" />
                  <Text text={`${stats.average}점`} type="body3" className="text-white font-bold" />
                </View>
              </View>
            </View>

            {/* 특별 점수들 */}
            {stats.count > 0 && (
              <View className="mb-6">
                <Text text="특별 점수" type="body2" className="text-white mb-4" />
                <View className="bg-gray700 rounded-lg p-4 mb-3">

                {/* 최고 점수 */}
                {stats.maxBook && (
                    <View className="flex-row items-start justify-between mb-2">
                      <Text text="최고" type="body3" className="text-gray300 w-1/12" />
                      <Text 
                      text={stats.maxBook.title} 
                      type="body3" 
                      className="text-white mx-2 flex-1 text-center" 
                      numberOfLines={1}
                    />
                      <Text text={`${stats.max}점`} type="body3" className="text-white font-bold w-1/6 text-right" />
                    </View>
                )}
                {/* 중간 점수 */}
                {stats.medianBook && (
                    <View className="flex-row items-start justify-between mb-2">
                      <Text text="중간" type="body3" className="text-gray300 w-1/12" />
                      <Text 
                      text={stats.medianBook.title} 
                      type="body3" 
                      className="text-white mx-2 flex-1 text-center" 
                      numberOfLines={1}
                    />
                      <Text text={`${stats.median}점`} type="body3" className="text-white font-bold w-1/6 text-right" />
                    </View>
                )}
                 {/* 최저 점수 */}
                 {stats.minBook && (
                    <View className="flex-row items-start justify-between mb-2">
                      <Text text="최저" type="body3" className="text-gray300 w-1/12" />
                      <Text 
                      text={stats.minBook.title} 
                      type="body3" 
                      className="text-white mx-2 flex-1 text-center" 
                      numberOfLines={1}
                    />
                      <Text text={`${stats.min}점`} type="body3" className="text-white font-bold w-1/6 text-right" />
                    </View>
                )}
                </View>

                

               
              </View>
            )}

            {/* 점수 분포 차트 */}
            {stats.count > 0 && (
              <View className="mb-6">
                <Text text="점수 분포" type="body2" className="text-white mb-4" />
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ alignItems: 'center' }}
                  style={{
                   borderRadius: 16,
                  }}
                >
                  <BarChart
                    width={Math.max(screenWidth - 48, 11 * 50)} // 최소 11개 구간 * 50px
                    height={220}
                    data={prepareChartData()}
                    verticalLabelRotation={0}
                    fromZero
                    showValuesOnTopOfBars
                    yAxisLabel=""
                    yAxisSuffix="권"
                    chartConfig={chartConfig}
                  />
                </ScrollView>
                <Text 
                  text="10점 단위로 각 구간별 평가한 책의 수를 나타냅니다 " 
                  type="caption1" 
                  className="text-gray400 text-center mt-2"
                />
              </View>
            )}

            {/* 데이터가 없는 경우 */}
            {stats.count === 0 && (
              <View className="items-center py-8">
                <Text 
                  text="아직 평가한 책이 없습니다" 
                  type="body2" 
                  className="text-gray400 mb-2"
                />
                <Text 
                  text="책을 읽고 평가해보세요!" 
                  type="body3" 
                  className="text-gray500"
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
