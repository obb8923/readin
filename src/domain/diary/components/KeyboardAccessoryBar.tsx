import React, { useEffect, useState } from 'react';
import { Platform, View, Keyboard, InputAccessoryView, TouchableOpacity, KeyboardEvent } from 'react-native';
import Animated, { Layout, ZoomIn, ZoomOut, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Text } from '@components/Text';
import { useSaveDiaryFlow } from '@libs/hooks/useSaveDiaryFlow';
import { useAnimationStore } from '@store/animationStore';
import { DIARY_ANIMATION_CONSTANTS } from '@constants/DiaryAnimation';

export const KeyboardAccessoryBar= () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { charactersCount, canSave, isSaving, save } = useSaveDiaryFlow();
  const [showSave, setShowSave] = useState(canSave);
  const { startSaveSequence } = useAnimationStore();
  const bottomPosition = useSharedValue(0);

  useEffect(() => {
    setShowSave(canSave);
  }, [canSave]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event: KeyboardEvent) => {
        setKeyboardHeight(event.endCoordinates.height);
        bottomPosition.value = withTiming(event.endCoordinates.height, {
          duration: DIARY_ANIMATION_CONSTANTS.KEYBOARD.ANIMATION_DURATION_MS,
          easing: Easing.out(Easing.cubic),
        });
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        bottomPosition.value = withTiming(0, {
          duration: DIARY_ANIMATION_CONSTANTS.KEYBOARD.ANIMATION_DURATION_MS,
          easing: Easing.out(Easing.cubic),
        });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [bottomPosition]);

  const handleSave = async () => {
    if (!canSave) return;
    // 키보드가 열려있으면 명시적으로 닫기
    Keyboard.dismiss();
    startSaveSequence(save);
  };

  const handleBack = () => {
    // 뒤로가기 , 스케일을 줄이고 커버 닫기 (DiaryCover 애니메이션의 반대)
    const { animateToScale, startClosing } = useAnimationStore.getState();
    animateToScale(DIARY_ANIMATION_CONSTANTS.SCALE.CLOSED); // 스케일을 닫힌 상태로 줄임
    setTimeout(() => {
      startClosing(); // 커버 닫기
    }, DIARY_ANIMATION_CONSTANTS.COVER.CLOSE_DELAY_MS); // 약간의 지연을 줘서 스케일 변화 후 커버 닫기
    Keyboard.dismiss();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      bottom: bottomPosition.value,
    };
  });


  const Bar = (
    <View
      className="bg-blue-100 h-12 px-4 flex-row items-center justify-between relative"
    >
      <Text text={`${charactersCount}자`} type="kb2023" className="text-text-blue" />

      <Animated.View layout={Layout.springify().stiffness(DIARY_ANIMATION_CONSTANTS.SPRING.LAYOUT_STIFFNESS).damping(DIARY_ANIMATION_CONSTANTS.SPRING.LAYOUT_DAMPING)} className="flex-row items-center">
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.8}
          className="h-8 px-3 mr-2 rounded-full border border-text-blue justify-center items-center"
        >
          <Text text="← 뒤로가기" type="kb2023" className="text-text-blue" />
        </TouchableOpacity>
        
        {showSave && !isSaving && (
          <Animated.View 
          style={{ zIndex: 1 }}
          {...(Platform.OS === 'ios' && {
            entering: ZoomIn.springify().stiffness(DIARY_ANIMATION_CONSTANTS.SPRING.SAVE_BUTTON_STIFFNESS).damping(DIARY_ANIMATION_CONSTANTS.SPRING.SAVE_BUTTON_DAMPING),
            exiting: ZoomOut
          })}
          >
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.9}
              className="h-8 px-4 rounded-full justify-center items-center border border-text-blue bg-text-blue"
              disabled={isSaving}
            >
              <Text
                text="다 적었어요!"
                type="kb2023"
                className="text-blue-100"
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <>
        <InputAccessoryView nativeID={'DiaryAccessory'}>{Bar}</InputAccessoryView>
        {keyboardHeight === 0 && (
          <View className="absolute left-0 right-0 bottom-0 z-40">
            {Bar}
          </View>
        )}
      </>
    );
  }

  return (
    <Animated.View 
      pointerEvents="box-none" 
      className="absolute left-0 right-0 bottom-0 z-40"
      style={[
        animatedStyle
      ]}
    >
      {Bar}
    </Animated.View>
  );
};