import React, { useState, useRef, useEffect } from 'react';
import { View, Text,Alert, Animated, Button } from 'react-native';
import { supabase } from '../../../libs/supabase/supabase';
import DefaultButton from '../../../components/DefaultButton';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../nav/stack/Root';
import { CompositeScreenProps } from '@react-navigation/native';
import { AuthStackParamList } from '../../../nav/stack/Auth';
import AuthButton from '../../../components/AuthButton';
import TextInput from '../../../components/TextInput';
import AppLogo from '../../../../assets/svgs/AppLogo.svg';
import Background from '../../../components/Background';
import Divider from '../../../components/Divider';
type AuthStack = NativeStackScreenProps<AuthStackParamList, 'LogIn'>;
type RootStack = NativeStackScreenProps<RootStackParamList>;
type LoginScreenProps = CompositeScreenProps<AuthStack, RootStack>;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // State and Refs for animation
  const [showEmailInput, setShowEmailInput] = useState(false);
  const emailButtonOpacity = useRef(new Animated.Value(1)).current;
  const emailFormOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: '913491434166-rptdhu0dsl1e422345ps8agflt8aovl9.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      });
    } catch (error) {
      console.error('Google Sign-In configuration error:', error);
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('로그인 오류', error.message);
    } else {
      navigation.navigate("AppTab");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('Google UserInfo:', JSON.stringify(userInfo, null, 2)); // userInfo 객체 구조 확인을 위한 로그

      if (userInfo && userInfo.data && userInfo.data.idToken) {
        const idToken = userInfo.data.idToken;
        const name = userInfo.data.user.name; // name 값 가져오기
        console.log('User name:', name); // 가져온 name 값 로그 출력 (활용 방안에 따라 변경 가능)
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) {
          Alert.alert('Google 로그인 오류', error.message);
        } else if (data.session) {
          navigation.navigate('AppTab');
        }
      } else {
        Alert.alert('Google 로그인 오류', 'Google ID 토큰을 가져오지 못했습니다. 콘솔 로그에서 userInfo 객체 구조를 확인해주세요.');
      }
    } catch (error: any) {
      if (error.code) {
        console.log('Google Sign-In error code:', error.code, error.message);
        if (error.code !== '12501' && error.code !== 12501 && error.code !== 'SIGN_IN_CANCELLED') {
          Alert.alert('Google 로그인 오류', `오류 코드: ${error.code} - ${error.message}`);
        }
      } else {
        console.log('Google Sign-In unexpected error:', error);
        Alert.alert('Google 로그인 오류', '알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Animation effect
  useEffect(() => {
    if (showEmailInput) {
      // Fade out button, fade in form
      Animated.parallel([
        Animated.timing(emailButtonOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(emailFormOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Fade in button, fade out form
      Animated.parallel([
         Animated.timing(emailButtonOpacity, {
           toValue: 1,
           duration: 300,
           useNativeDriver: true,
         }),
         Animated.timing(emailFormOpacity, {
           toValue: 0,
           duration: 300,
           useNativeDriver: true,
         })
       ]).start();
    }
  }, [showEmailInput, emailButtonOpacity, emailFormOpacity]);

  return (
    <Background>
    <View className="flex-1 flex-col justify-start items-center p-5">
    <View style={{height: '10%'}} />
      {/* 로고 이미지 */}
      <AppLogo style={{marginTop: '10%',marginBottom: '10%'}}/>
      {/* 구분선 */}
      <Divider text="로그인/회원가입"  />
      {/*Google Login Button */}
      <View style={{width: '80%'}}>
      <AuthButton handleLogin={handleGoogleLogin} loading={loading} type="google" />
      </View>

      {/* Conditionally render Email Login Button */} 
      {!showEmailInput && (
        <Animated.View style={{ opacity: emailButtonOpacity, width: '80%' }} pointerEvents={showEmailInput ? 'none' : 'auto'}>
         <AuthButton handleLogin={() => setShowEmailInput(true)} loading={loading} type="email" />
        </Animated.View>
      )}
     {/* Conditionally render Email Input Area */}
     {showEmailInput && (
        <Animated.View style={{ opacity: emailFormOpacity, width: '80%', }} className="items-center">
          <TextInput placeholder="이메일 입력" value={email} onChangeText={setEmail} secureTextEntry={false} autoCapitalize="none" keyboardType="email-address" />
         <TextInput placeholder="비밀번호 입력" value={password} onChangeText={setPassword} secureTextEntry={true} autoCapitalize="none" keyboardType="default" />
            <DefaultButton 
            title={loading ? "로그인 중..." : "로그인"} 
            onPress={handleLogin} 
            disabled={loading} 
            className={`w-full mb-4`}
            />
            <DefaultButton 
            title="회원가입" 
            onPress={() => navigation.navigate("AuthStack", { screen: "SignUp" })}
            className="w-full"
            /> 
          </Animated.View>
      )}

      {/* 이메일 버튼 애니메이션 디버그 */}
     {/* <Button title="debug" onPress={() => setShowEmailInput(prev=>!prev)} /> */}
    </View>
    </Background>
  );
}

export default LoginScreen;
