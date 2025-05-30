import React, { useEffect } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import { supabase } from '../../../libs/supabase/supabase'; // Supabase 클라이언트 import
import DefaultButton from '../../../components/DefaultButton';
import { AuthStackParamList } from '../../../nav/stack/Auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TextInput from '../../../components/TextInput';
import Divider from '../../../components/Divider';
import LogoIcon from '../../../../assets/svgs/readin.svg';
type SignUpScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;


export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isLogoVisible, setIsLogoVisible] = React.useState(true); // 로고 표시 상태

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsLogoVisible(false); // 키보드가 나타나면 로고 숨김
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsLogoVisible(true); // 키보드가 사라지면 로고 표시
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (nickname.length > 10) {
        Alert.alert('오류', '닉네임은 10자 이하이어야 합니다.');
        return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { 
          nickname: nickname,
        }
      }
    });

    if (error) {
      Alert.alert('회원가입 오류', error.message);
    } else if (data.session) {
      // 이메일 인증이 활성화된 경우, data.user는 있지만 data.session은 null일 수 있음
      // 여기서는 세션이 바로 생성되는 경우 (이메일 인증 비활성화 등)
      Alert.alert('회원가입 성공', '로그인 페이지로 이동합니다.');
      navigation.navigate('LogIn'); // 회원가입 성공 후 로그인 페이지로 이동
    } else if (data.user) {
      // 이메일 인증이 필요한 경우
      Alert.alert('회원가입 성공', '인증 이메일을 확인해주세요.');
      // 필요하다면 로그인 페이지나 다른 안내 페이지로 이동
      navigation.navigate('LogIn'); 
    }
    setLoading(false);
  };

  return (
<KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-col flex-1 justify-start items-center p-5 bg-background">
        {isLogoVisible && (
          <>
            {/* 로고 이미지 */}
            <LogoIcon/>
            </>
        )}
         {/* 구분선 */}
         <Divider text="회원가입"/>
      <TextInput
        placeholder="닉네임 입력 (10자 이하)"
        value={nickname}
        onChangeText={setNickname}
        autoCapitalize="words"
        maxLength={10}
      />
      <TextInput
        placeholder="이메일 입력"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="비밀번호 입력 (6자 이상)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        placeholder="비밀번호 확인"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <DefaultButton title={loading ? "가입 중..." : "회원가입"} onPress={handleSignUp} disabled={loading} />
      <View className="h-[100]"/>
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
} 
