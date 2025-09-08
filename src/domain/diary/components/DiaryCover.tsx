import React, { useEffect } from 'react';
import { TouchableWithoutFeedback, Image, LayoutChangeEvent } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAnimationStore } from '@store/animationStore';
import { DIARY_ANIMATION_CONSTANTS } from '@constants/DiaryAnimation';

// 일기장 덮개: 왼쪽 힌지를 기준으로 3D 회전하며 닫히고 열리는 애니메이션
export const DiaryCover = () => {
  // 0: 완전히 열림, 1: 완전히 닫힘 (초기값: 닫힌 상태)
  const progress = useSharedValue(DIARY_ANIMATION_CONSTANTS.PROGRESS.FULLY_CLOSED);

  const { direction, triggerId } = useAnimationStore();

  const handleCoverTouch = () => {
    const { animateToScale, startOpening } = useAnimationStore.getState()
    startOpening()
    setTimeout(() => {
      animateToScale(DIARY_ANIMATION_CONSTANTS.SCALE.OPENED)
    }, DIARY_ANIMATION_CONSTANTS.COVER.SCALE_CHANGE_DELAY_MS)
  }

  useAnimatedReaction(
    () => ({ direction, triggerId }),
    (state, prev) => {
      if (!state) return;
      if (prev && state.triggerId === prev.triggerId) return;
      const toValue = state.direction === 'close' ? DIARY_ANIMATION_CONSTANTS.PROGRESS.FULLY_CLOSED : DIARY_ANIMATION_CONSTANTS.PROGRESS.FULLY_OPENED;
      progress.value = withTiming(toValue, { duration: DIARY_ANIMATION_CONSTANTS.COVER.DURATION_MS, easing: Easing.inOut(Easing.cubic) });
    }
  );

  // 커버 실제 폭 (힌지 고정용)
  const coverWidth = useSharedValue(0);
  const onCoverLayout = (e: LayoutChangeEvent) => {
    coverWidth.value = e.nativeEvent.layout.width;
  };

  // 덮개가 완전히 열려있을 때(progress가 0에 가까울 때)는 터치 이벤트를 차단하지 않음
  const containerStyle = useAnimatedStyle(() => {
    const shouldBlockTouch = progress.value > DIARY_ANIMATION_CONSTANTS.COVER.TOUCH_THRESHOLD; // 임계값 이상 닫혀있을 때만 터치 차단
    return {
      pointerEvents: shouldBlockTouch ? 'auto' : 'none'
    };
  });

  // 왼쪽 힌지 기준 3D 회전
  const cover3DStyle = useAnimatedStyle(() => {
    const angle = interpolate(
      progress.value,
      [DIARY_ANIMATION_CONSTANTS.PROGRESS.FULLY_OPENED, DIARY_ANIMATION_CONSTANTS.PROGRESS.FULLY_CLOSED],
      [-180, 0]
    );
    const half = coverWidth.value / 2;
    return {
      backfaceVisibility: 'hidden',
      transform: [
        { perspective: 1000 },
        { translateX: -half },
        { rotateY: `${angle}deg` },
        { translateX: half },
      ],
    };
  });

  return (
    <TouchableWithoutFeedback onPress={handleCoverTouch}>
      <Animated.View 
        className="absolute inset-0 z-40"
        style={containerStyle}
      >
        <Animated.View onLayout={onCoverLayout} style={cover3DStyle} className="absolute left-0 top-0 h-full w-full">
          <Image 
            source={require('@assets/Cover/C1.png')} 
            className="w-full h-full"
            resizeMode="cover"
          />
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

