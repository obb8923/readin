import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, Image, TouchableOpacity, Animated } from 'react-native';
// import { supabase } from '../../../lib/supabase';
// import Up from 'react-native-vector-icons/'
import DefaultButton from '../../../components/DefaultButton';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import MailIcon from '../../../../assets/svgs/Mail.svg'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../nav/stack/Root';

type LoginScreenProps = NativeStackScreenProps<
RootStackParamList,
'AuthStack'
>;
const LoginScreen = ({navigation}: LoginScreenProps) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // State and Refs for animation
  const [showEmailInput, setShowEmailInput] = useState(false);
  const emailButtonOpacity = useRef(new Animated.Value(1)).current;
  const emailFormOpacity = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId: '913491434166-rptdhu0dsl1e422345ps8agflt8aovl9.apps.googleusercontent.com', // 중요: 실제 Google Cloud Console에서 발급받은 웹 클라이언트 ID로 반드시 교체해주세요.
  //     scopes: ['profile', 'email'],
  //   });
  // }, []);

  const handleLogin = async () => {
    setLoading(true);
    // const { error } = await supabase.auth.signInWithPassword({
    //   email: email,
    //   password: password,
    // });

    // if (error) {
    //   Alert.alert('로그인 오류', error.message);
    // } else {
    //   navigation.navigate("AppStack", { screen: "Home" });
    // }
    setLoading(false);
  };

  // const handleGoogleLogin = async () => {
  //   setLoading(true);
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     console.log('Google UserInfo:', JSON.stringify(userInfo, null, 2)); // userInfo 객체 구조 확인을 위한 로그

  //     // @ts-ignore // TODO: userInfo 객체 구조를 확인하고 idToken에 정확하게 접근하도록 수정해주세요.
  //     if (userInfo && userInfo.idToken) {
  //       // @ts-ignore // TODO: userInfo 객체 구조를 확인하고 idToken에 정확하게 접근하도록 수정해주세요.
  //       const idToken = userInfo.idToken;
  //       const { data, error } = await supabase.auth.signInWithIdToken({
  //         provider: 'google',
  //         token: idToken,
  //       });

  //       if (error) {
  //         Alert.alert('Google 로그인 오류', error.message);
  //       } else if (data.session) {
  //         router.replace('/(tabs)');
  //       }
  //     } else {
  //       Alert.alert('Google 로그인 오류', 'Google ID 토큰을 가져오지 못했습니다. 콘솔 로그에서 userInfo 객체 구조를 확인해주세요.');
  //     }
  //   } catch (error: any) {
  //     if (error.code) {
  //       console.log('Google Sign-In error code:', error.code, error.message);
  //       if (error.code !== '12501' && error.code !== 12501 && error.code !== 'SIGN_IN_CANCELLED') {
  //         Alert.alert('Google 로그인 오류', `오류 코드: ${error.code} - ${error.message}`);
  //       }
  //     } else {
  //       console.log('Google Sign-In unexpected error:', error);
  //       Alert.alert('Google 로그인 오류', '알 수 없는 오류가 발생했습니다.');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
    <View className="flex-1 flex-col justify-start items-center p-5 bg-white">
    <View style={{height: '10%'}} />
        {/* 로고 이미지 */}
      {/* <Image 
        source={require('@/assets/images/logo_text.png')}
        className="w-1/2 mb-5"
        resizeMode="contain"
      /> */}
      {/* 구분선 */}
      <View className="w-full mb-10 flex-row items-center justify-center">
      <View className="absolute top-1/2 left-0 bg-gray-200 w-full h-[1px]" />
      <View className="bg-white px-4 py-2 rounded-full">
      <Text className="text-gray-500 text-sm font-p">로그인/회원가입</Text>
      </View>
      </View>
      {/*Google Login Button */}
      {/* {!showEmailInput && (
        <Animated.View style={{ opacity: emailButtonOpacity, width: '80%' }} pointerEvents={showEmailInput ? 'none' : 'auto'}>
          <TouchableOpacity
            className="h-12 bg-[#4285F4] font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center mb-6 w-full flex-row justify-center"
            onPress={handleGoogleLogin} // Google 로그인 함수 연결
            disabled={loading}
          >
            <Ionicons name="logo-google" size={16} color="white" style={{marginRight: 8}} />
            <Text className="text-white font-medium text-base">구글로 시작하기</Text>
          </TouchableOpacity>
        </Animated.View>
      )} */}

      {/* Conditionally render Email Login Button */} 
      {!showEmailInput && (
        <Animated.View style={{ opacity: emailButtonOpacity, width: '80%' }} pointerEvents={showEmailInput ? 'none' : 'auto'}>
          <TouchableOpacity 
            className="h-12 bg-[#eceef5] font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center mb-6 w-full flex-row justify-center"
            onPress={() => setShowEmailInput(true)} // Trigger state change
          >
            <MailIcon width={16} height={16} color="#1B91F3" style={{marginRight: 8}} />
            <Text className="text-[#1B91F3] font-medium text-base">이메일로 시작하기</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
     {/* Conditionally render Email Input Area */}
     {showEmailInput && (
        <Animated.View style={{ opacity: emailFormOpacity, width: '80%' }} className="items-center">
          <TextInput
            className="h-12 w-full border border-gray-300 px-3 py-2.5 mb-3 rounded text-base flex-row items-center justify-center font-p"
            placeholder="이메일 입력"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            className="h-12 w-full border border-gray-300 px-3 py-2.5 mb-5 rounded text-base font-p"
            placeholder="비밀번호 입력"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
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
  );
}

export default LoginScreen;
