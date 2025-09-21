import { View, Text, TouchableOpacity } from "react-native";
import GoogleLogo from '@assets/svgs/LogoGoogle.svg';
import AppleLogo from '@assets/svgs/LogoApple.svg';

export const AuthButton = ({handleLogin, loading, type}: {handleLogin: () => void, loading: boolean, type: 'google' | 'apple'}) => {   
  return (
    <TouchableOpacity
            className={`w-auto h-auto rounded-lg px-2 py-4 flex-row items-center justify-center bg-white`}
            onPress={handleLogin}
            disabled={loading}
          >
            {/* 아이콘 영역 */}
            <View className="mr-2">
            {type === 'google' && <GoogleLogo style={{width: 20, height: 20}}/>}
            {type === 'apple' && <AppleLogo style={{width: 20, height: 20}}/>}
            </View>
            {/* 텍스트 영역 */}
            <Text className={`text-black text-base text-center font-bold `}>{type === 'google' ? 'Google로 시작하기' : 'Apple로 시작하기'}</Text>
          </TouchableOpacity>
  );
};  