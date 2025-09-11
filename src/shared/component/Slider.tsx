import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import {Colors} from '@constant/Colors';
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureChangeEventPayload,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';

export type TSliderProps = {
  min: number;
  max: number;
  step?: number;
  width: number;
  height: number;
  borderRadius?: number;
  maximumTrackTintColor?: string;
  minimumTrackTintColor?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
  onComplete?: (value: number) => void;
  value?: number;
  showIndicator?: boolean;
  renderIndicator?: (value: number) => React.ReactNode | null;
  containerStyle?: StyleProp<ViewStyle>;
  sliderStyle?: StyleProp<ViewStyle>;
  renderIndicatorWidth?: number;
  animationConfig?: WithSpringConfig;
};

export type TSliderRef = {
  setValue: (value: number) => void;
  setState: (state: boolean) => void;
};

const calculateValue = (
  position: number,
  min: number,
  max: number,
  step: number,
  width: number
): number => {
  'worklet';//reanimated의 지시어: Reanimated가 이 함수를 Native 코드로 컴파일하여 성능을 극대화합니다
  let sliderPosition = position;
  sliderPosition = Math.min(Math.max(sliderPosition, 0), width);//슬라이더 위치 제한(0~width)
  let value = (sliderPosition / width) * (max - min) + min;//슬라이더 위치에 따른 값 계산
  value = Math.round(value / step) * step;//step 단위로 반올림
  value = Math.min(Math.max(value, min), max);//값 범위 제한(min~max)
  return value;
};

const RNHorizontalSlider = React.forwardRef<TSliderRef, TSliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      width = 300,
      height = 10,
      borderRadius = 5,
      maximumTrackTintColor = Colors.gray200,
      minimumTrackTintColor = Colors.primary,
      disabled = false,
      onChange = () => {},
      onComplete = () => {},
      value: currentValue = 0,
      showIndicator = false,
      renderIndicatorWidth = 40,
      renderIndicator = () => null,
      containerStyle = {},
      sliderStyle = {},
      animationConfig = { damping: 15 },
    },
    ref
  ) => {
    let point = useSharedValue<number>(currentValue);
    let disabledProp = useSharedValue<boolean>(disabled);
    // Memoized BaseView styles
    const calculateBaseView = () => ({ height, width, borderRadius, backgroundColor: maximumTrackTintColor });
    const baseViewStyle = React.useMemo(calculateBaseView, [borderRadius, height, maximumTrackTintColor, width]);
    // Gesture handler
    const handleGesture = (type: 'BEGIN' | 'CHANGE' | 'END') => (eventX: number) => {
        if (disabledProp.value) return;
        let value = calculateValue(eventX, min, max, step, width);
        point.value = withSpring(value, animationConfig);
        runOnJS(type === 'BEGIN' || type === 'CHANGE' ? onChange : onComplete)(value);
      };
    const onGestureStart = (
      event: GestureStateChangeEvent<PanGestureHandlerEventPayload>
    ) => handleGesture('BEGIN')(event.x);
    const onGestureChange = (
      event: GestureUpdateEvent<
        PanGestureHandlerEventPayload & PanGestureChangeEventPayload
      >
    ) => handleGesture('CHANGE')(event.x);
    const onGestureEnd = (
      event: GestureStateChangeEvent<PanGestureHandlerEventPayload>
    ) => handleGesture('END')(event.x);
    const panGesture = Gesture.Pan()
      .onBegin(onGestureStart)
      .onChange(onGestureChange)
      .onEnd(onGestureEnd)
      .onFinalize(onGestureEnd)
      .runOnJS(true);
    // Ref methods
    React.useImperativeHandle(ref, () => ({
      setValue: (value: number) => {
        point.value = withSpring(value, animationConfig);
        onChange(value);
      },
      setState: (state: boolean) => {
        disabledProp.value = state;
      },
    }));
    // slider styles
    const slider = useAnimatedStyle(() => {
      let widthPercentage = ((point.value - min) / (max - min)) * 100;
      const style: ViewStyle = {
        backgroundColor: minimumTrackTintColor,
        width: `${widthPercentage}%`,
      };
      return style;
    }, [point.value, min, max]);
    // indicator styles
    const indicator = useAnimatedStyle(() => {
      const style: ViewStyle = {};
      if (showIndicator) {
        let left = ((point.value - min) / (max - min)) * width;
        left = Math.min(Math.max(left - renderIndicatorWidth / 2, 0), width - renderIndicatorWidth);
        style.left = left;
      }
      return style;
    }, [point.value, min, max, width, showIndicator, renderIndicatorWidth]);
    return (
      <GestureDetector gesture={panGesture}>
        <View style={[baseViewStyle, styles.container, containerStyle]}>
          <View style={[styles.box, baseViewStyle, sliderStyle]}>
            <Animated.View style={[styles.box, slider]} />
          </View>
          {showIndicator && (
            <Animated.View style={[styles.indicatorContainer, indicator]}>
              {renderIndicator(point.value)}
            </Animated.View>
          )}
        </View>
      </GestureDetector>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    
  },
  box: {
    position: 'absolute',
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  indicatorContainer: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
  },
  indicator: {
    // position: 'absolute',
  },
});

export default RNHorizontalSlider;