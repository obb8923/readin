import React, { useState, useRef } from 'react';
import { TouchableOpacity, View, Text, Platform, UIManager, Animated, LayoutChangeEvent, ScrollView } from 'react-native';
import ChevronDown from '../../../../../assets/svgs/ChevronDown.svg';
import { tabnavheight } from '../../../../constants/normal';
import { Terms, Privacy } from '../../../../constants/TermsAndPolicy';
import Background from '../../../../components/Background';
// Android에서 LayoutAnimation을 사용하기 위한 설정
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface IsOpenState {
  terms: boolean;
  privacy: boolean;
}

const TermsAndPolicyScreen = () => {
  const [isOpen, setIsOpen] = useState<IsOpenState>({
    terms: false,
    privacy: false,
  });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const termsHeightAnim = useRef(new Animated.Value(0)).current;
  const privacyHeightAnim = useRef(new Animated.Value(0)).current;

  const toggleOpen = (type: keyof IsOpenState) => {
    const CONTENT_MAX_HEIGHT = containerSize.height > 100 ? containerSize.height - 100 : 0;
    const nextIsOpenState = {
      terms: type === 'terms' ? !isOpen.terms : false,
      privacy: type === 'privacy' ? !isOpen.privacy : false,
    };
    setIsOpen(nextIsOpenState);

    Animated.timing(termsHeightAnim, {
      toValue: nextIsOpenState.terms ? CONTENT_MAX_HEIGHT : 0,
      duration: 300,
      useNativeDriver: false, // height 애니메이션은 네이티브 드라이버 사용 불가
    }).start();

    Animated.timing(privacyHeightAnim, {
      toValue: nextIsOpenState.privacy ? CONTENT_MAX_HEIGHT : 0,
      duration: 300,
      useNativeDriver: false, // height 애니메이션은 네이티브 드라이버 사용 불가
    }).start();
  };
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };
  return (
    <Background>
    <View className='flex-1 p-6' style={{ paddingBottom: tabnavheight + 10 }}>
      <View className='flex-1' onLayout={handleLayout}>
      <ProfileButton text="이용약관" isOpen={isOpen.terms} onPress={() => toggleOpen('terms')} />
      {/* 이용약관 컨텐츠 영역 */}
      <Animated.View
        style={[
          { overflow: 'hidden', height: termsHeightAnim },
        ]}
        className={`bg-white rounded-md shadow${isOpen.terms ? 'p-4' : 'p-0'}`}
      >
        <ScrollView>
          <Text className="text-gray-700 font-p">
            {Terms}
          </Text>
        </ScrollView>
      </Animated.View>

      <ProfileButton text="개인정보처리방침" isOpen={isOpen.privacy} onPress={() => toggleOpen('privacy')} />
      {/* 개인정보처리방침 컨텐츠 영역 */}
      <Animated.View
        style={[
          { overflow: 'hidden', height: privacyHeightAnim },
        ]}
        className={`bg-white rounded-md shadow my-2 ${isOpen.privacy ? 'p-4' : 'p-0'}`}
      >
        <ScrollView>
          <Text className="text-gray-700 font-p">
            {Privacy}
          </Text>
        </ScrollView>
      </Animated.View>
      </View>
    </View>
    </Background>
  );
}

export default TermsAndPolicyScreen;

export const ProfileButton = ({ text, onPress, isOpen }: { text: string, onPress: () => void, isOpen: boolean }) => {
  return (
    <TouchableOpacity
      className="flex-row justify-between items-center py-3 border-b border-gray-200 h-[50]"
      onPress={onPress}
    >
      <Text className="text-base text-gray-600 font-p">{text}</Text>
      <ChevronDown style={{color:'#6b7280', transform: [{rotate: isOpen ? '180deg' : '0deg'}]}}/>
    </TouchableOpacity>
  );
};