import { TextInput as RNTextInput, View, Text, Animated } from 'react-native';
import { useState, useRef } from 'react';

type TextInputProps = {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    maxLength?: number;
}

const TextInput = ({placeholder, value, onChangeText, secureTextEntry = false, autoCapitalize = 'none', keyboardType = 'default', maxLength}: TextInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;

    // 포커스 시 애니메이션 값을 0에서 1로 변경
    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    // 값이 비어있을 경우에 애니메이션 값을 1에서 0으로 변경
    const handleBlur = () => {
        if (!value) {
            setIsFocused(false);
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    };

    const placeholderStyle = {
        transform: [{
            translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [10, -12]
            })
        }],
    };

    return (
        <View className="relative h-12 w-full mb-8">
            <Animated.Text 
                className={`absolute left-2 z-10 bg-white px-1 font-p ${isFocused ? 'text-[#1B91F3]' : 'text-gray-500'}`}
                style={placeholderStyle}
            >
                {placeholder}
            </Animated.Text>
            <RNTextInput
                className={`h-12 w-full border-b px-3 py-2.5 rounded text-base flex-row items-center justify-center font-p ${isFocused ? 'border-[#1B91F3]' : 'border-gray-300'}`}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                autoCapitalize={autoCapitalize}
                keyboardType={keyboardType}
                onFocus={handleFocus}
                onBlur={handleBlur}
                maxLength={maxLength}
            />
        </View>
    )
}

export default TextInput;