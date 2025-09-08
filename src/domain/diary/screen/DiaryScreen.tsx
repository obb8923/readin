import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Background } from '@components/Background';
import { Diary } from '@/domain/diary/components/Diary';
import { useAnimationStore } from '@/shared/store/animationStore';
import {TabBar} from '@/shared/components/TabBar';
import { DIARY_ANIMATION_CONSTANTS } from '@constants/DiaryAnimation';

export const DiaryScreen = () => {
  const transformScale = useAnimationStore(state => state.transformScale);
  const scale = useSharedValue<number>(DIARY_ANIMATION_CONSTANTS.SCALE.CLOSED);

  // transformScale 변화에 따라 부드럽게 애니메이션
  useEffect(() => {
    scale.value = withTiming(transformScale, {
      duration: DIARY_ANIMATION_CONSTANTS.SCALE.TRANSITION_DURATION_MS,
      easing: Easing.out(Easing.cubic)
    });
  }, [transformScale, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Background isStatusBarGap={true} isTabBarGap={true} isImage={1}>
      {transformScale !== 1 && <TabBar />}
      <Animated.View 
        style={[
          animatedStyle,
          {
            flex: 1,
            // 열린 상태에서는 전체 화면, 닫힌 상태에서는 중앙 정렬
            ...(transformScale === DIARY_ANIMATION_CONSTANTS.SCALE.OPENED 
              ? {} 
              : { justifyContent: 'center', alignItems: 'center' }
            )
          }
        ]}
      >
        <Diary />
      </Animated.View>
    </Background>
  );
}