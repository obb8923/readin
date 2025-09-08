import React, { useEffect, useCallback } from "react"
import Animated, { 
  Easing, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  runOnJS
} from 'react-native-reanimated'
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAnimationStore } from "@store/animationStore"
import { DiaryCover } from "@/domain/diary/components/DiaryCover"
import { DiaryPaper } from "@/domain/diary/components/DiaryPaper"
import { DIARY_ANIMATION_CONSTANTS } from "@constants/DiaryAnimation"
import { getDiaryDimensions } from "@constants/normal"

export const Diary = () => {
  const insets = useSafeAreaInsets();
  const { saveSequenceId, saveAnimationStep, setSaveAnimationStep, startClosing, startOpening, transformScale, animateToScale } = useAnimationStore();
  
  // 애니메이션 값들
  const rotateZ = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  // 정방향 애니메이션 단계별 함수들
  const startClosingCover = useCallback(() => {
    setSaveAnimationStep('closing_cover');
    startClosing(); // 커버 닫기 애니메이션 시작
  }, [setSaveAnimationStep, startClosing]);

  const startScaling = useCallback(() => {
    setSaveAnimationStep('scaling');
    // 글로벌 transformScale 사용 (뒤로가기와 동일한 효과)
    animateToScale(DIARY_ANIMATION_CONSTANTS.SCALE.CLOSED);
    // 애니메이션 시간 후 다음 단계로
    setTimeout(() => {
      startClosingCover();
    }, DIARY_ANIMATION_CONSTANTS.SAVE_ANIMATION.SCALE_DURATION_MS);
  }, [animateToScale, setSaveAnimationStep, startClosingCover]);

  const startRotating = useCallback(() => {
    setSaveAnimationStep('rotating');
    rotateZ.value = withTiming(DIARY_ANIMATION_CONSTANTS.SAVE_ANIMATION.ROTATE_DEGREES, {
      duration: DIARY_ANIMATION_CONSTANTS.SAVE_ANIMATION.ROTATE_DURATION_MS,
      easing: Easing.inOut(Easing.cubic)
    }, () => {
      runOnJS(startLifting)();
    });
  }, [rotateZ, setSaveAnimationStep]);

  const startLifting = useCallback(() => {
    setSaveAnimationStep('lifting');
    translateY.value = withTiming(DIARY_ANIMATION_CONSTANTS.SAVE_ANIMATION.LIFT_OFFSET, {
      duration: DIARY_ANIMATION_CONSTANTS.SAVE_ANIMATION.LIFT_DURATION_MS,
      easing: Easing.out(Easing.cubic)
    }, () => {
      runOnJS(setWaitingForResult)();
    });
  }, [translateY, setSaveAnimationStep]);

  const setWaitingForResult = useCallback(() => {
    setSaveAnimationStep('waiting_for_result');
  }, [setSaveAnimationStep]);

  const startSaveAnimation = useCallback(() => {
    try {
      // 1단계: 스케일 축소부터 시작 (동기적으로 연결됨)
      startScaling();
    } catch (error) {
      console.error('저장 애니메이션 오류:', error);
      setSaveAnimationStep('idle');
    }
  }, [startScaling, setSaveAnimationStep]);

  // 역방향 애니메이션 단계별 함수들 (5. 역순서)
  const showResult = useCallback(() => {
    setSaveAnimationStep('showing_result');
    // 애니메이션 완료 후 idle 상태로 복구
    setTimeout(() => {
      setSaveAnimationStep('idle');
    }, 1000);
  }, [setSaveAnimationStep]);

  const startReverseScaling = useCallback(() => {
    setSaveAnimationStep('reverse_scaling');
    // 5-4. 스케일 복구 (작은크기 → 원래크기)
    animateToScale(DIARY_ANIMATION_CONSTANTS.SCALE.OPENED);
    // 애니메이션 시간 후 다음 단계로
    setTimeout(() => {
      showResult();
    }, DIARY_ANIMATION_CONSTANTS.SAVE_ANIMATION.SCALE_DURATION_MS);
  }, [animateToScale, setSaveAnimationStep, showResult]);

  const startOpeningCover = useCallback(() => {
    setSaveAnimationStep('opening_cover');
    // 5-3. 커버 열기
    startOpening();
  }, [setSaveAnimationStep, startOpening]);

  const startReverseRotating = useCallback(() => {
    setSaveAnimationStep('reverse_rotating');
    // 5-2. 회전 복구 (180도 → 0도)
    rotateZ.value = withTiming(0, {
      duration: DIARY_ANIMATION_CONSTANTS.SAVE_ANIMATION.ROTATE_DURATION_MS,
      easing: Easing.inOut(Easing.cubic)
    }, () => {
      runOnJS(startOpeningCover)();
    });
  }, [rotateZ, setSaveAnimationStep, startOpeningCover]);

  const startReverseLifting = useCallback(() => {
    setSaveAnimationStep('reverse_lifting');
    // 5-1. 디바이스 위에서 아래로 내리기
    translateY.value = withTiming(0, {
      duration: DIARY_ANIMATION_CONSTANTS.SAVE_ANIMATION.LIFT_DURATION_MS,
      easing: Easing.in(Easing.cubic)
    }, () => {
      runOnJS(startReverseRotating)();
    });
  }, [translateY, setSaveAnimationStep, startReverseRotating]);

  const startReverseAnimation = useCallback(() => {
    // 역방향 애니메이션 시작 (5. 역순서)
    startReverseLifting();
  }, [startReverseLifting]);

  // 저장 애니메이션 시퀀스 처리
  useEffect(() => {
    if (saveAnimationStep === 'saving') {
      startSaveAnimation();
    } else if (saveAnimationStep === 'closing_cover') {
      // 2. 커버 닫기 완료 후 회전 시작
      setTimeout(() => {
        startRotating();
      }, DIARY_ANIMATION_CONSTANTS.COVER.DURATION_MS);
    } else if (saveAnimationStep === 'opening_cover') {
      // 5-3. 커버 열기 완료 후 스케일 복구 시작
      setTimeout(() => {
        startReverseScaling();
      }, DIARY_ANIMATION_CONSTANTS.COVER.DURATION_MS);
    } else if (saveAnimationStep === 'reversing') {
      startReverseAnimation();
    }
  }, [saveSequenceId, saveAnimationStep, startSaveAnimation, startRotating, startReverseScaling, startReverseAnimation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotateZ: `${rotateZ.value}deg` },
        { translateY: translateY.value }
      ],
    };
  });

  
  // transformScale에 따라 다이어리 크기 결정
  const isOpened = transformScale === DIARY_ANIMATION_CONSTANTS.SCALE.OPENED;
  const { width: diaryWidth, height: diaryHeight } = getDiaryDimensions(insets, isOpened);

  return (
    <Animated.View 
      style={[
        animatedStyle,
        {
          width: diaryWidth,
          height: diaryHeight,
        }
      ]}
    >
      <DiaryPaper />
      <DiaryCover />
    </Animated.View>
  )
}