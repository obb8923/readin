import React from 'react';
import { View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from './Text';
import { Colors } from '../constant/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReadingLevel, getAllReadingLevels, getReadingLevel } from '../constant/ReadingLevels';

interface ReadingLevelModalProps {
  visible: boolean;
  onClose: () => void;
  currentThickness: number; // 현재 총 두께 (mm)
}

export const ReadingLevelModal = ({ visible, onClose, currentThickness }: ReadingLevelModalProps) => {
  const insets = useSafeAreaInsets();
  const allLevels = getAllReadingLevels();
  
  // 두께를 정확한 단위로 포맷팅하는 함수 (예: 1m50cm, 55cm, 25mm)
  const formatThickness = (thicknessInMm: number): string => {
    if (thicknessInMm >= 1000) {
      const meters = Math.floor(thicknessInMm / 1000);
      const centimeters = Math.floor((thicknessInMm % 1000) / 10);
      if (centimeters > 0) {
        return `${meters}m${centimeters}cm`;
      } else {
        return `${meters}m`;
      }
    } else if (thicknessInMm >= 10) {
      const centimeters = Math.floor(thicknessInMm / 10);
      const millimeters = thicknessInMm % 10;
      if (millimeters > 0) {
        return `${centimeters}cm${millimeters}mm`;
      } else {
        return `${centimeters}cm`;
      }
    } else {
      return `${thicknessInMm}mm`;
    }
  };

  // 현재 레벨 계산
  const currentLevel = getReadingLevel(currentThickness);

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
            <Text text="독서 레벨" type="title3" className="text-white" />
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray700 rounded-full p-2"
              activeOpacity={0.8}
            >
              <Text text="닫기" type="body2" className="text-white" />
            </TouchableOpacity>
          </View>

          <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 24,
          }}
          >
            {/* 현재 레벨 표시 */}
            <View className="mb-6">
              <Text text="현재 레벨" type="body2" className="text-white mb-4" />
              <View className="bg-gray700 rounded-lg p-4">
                <View className="flex-row items-center justify-between">
                  <Text 
                    text={currentLevel.title} 
                    type="body1" 
                    className="text-primary font-bold" 
                  />
                  <Text text={`${formatThickness(currentThickness)}`} type="body3" className="text-gray300" />
                </View>
              </View>
            </View>

            {/* 모든 레벨 목록 */}
            <View className="mb-6">
              <Text text="독서 레벨 목록" type="body2" className="text-white mb-4" />
              <View className="bg-gray700 rounded-lg p-4">
                {allLevels.map((level, index) => {
                  const isUnlocked = level.limit <= currentThickness;
                  const remaining = level.limit - currentThickness;
                  
                  return (
                    <View 
                      key={level.limit} 
                      className={`flex-row items-center justify-between min-h-[48px] ${index !== allLevels.length - 1 ? 'mb-3' : ''}`}
                    >
                      <View className="flex-1">
                        <Text 
                          text={level.title} 
                          type="body3" 
                          className={isUnlocked ? "text-white font-bold" : "text-gray400 font-bold"} 
                        />
                        <Text 
                          text={`${formatThickness(level.limit)} 이상`} 
                          type="caption1" 
                          className={isUnlocked ? "text-gray300 mt-1" : "text-gray500 mt-1"} 
                        />
                      </View>
                      <View className="min-w-[60px] items-end">
                        {isUnlocked ? (
                          <Text 
                            text="✓" 
                            type="body2" 
                            className="text-primary font-bold" 
                          />
                        ) : (
                          <Text 
                            text={`${formatThickness(remaining)} 필요`} 
                            type="caption1" 
                            className="text-gray400" 
                          />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

