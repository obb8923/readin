import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../../../store/authStore';
import { supabase } from '../../../libs/supabase/supabase';
import { requestAccountDeletion } from '../../../libs/supabase/supabaseOperations';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../nav/stack/Profile';
import ChevronRight from '../../../../assets/svgs/ChevronRight.svg';
import { RootStackParamList } from '../../../nav/stack/Root';
import { CompositeScreenProps } from '@react-navigation/native';
import Background from '../../../components/Background';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

type ProfileProps = NativeStackScreenProps<ProfileStackParamList,'Profile'>;
type RootStackProps = NativeStackScreenProps<RootStackParamList>;
type ProfileScreenProps = CompositeScreenProps<ProfileProps, RootStackProps>

const ProfileScreen=({navigation}: ProfileScreenProps) =>{
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const [userName, setUserName] = useState<string>('이름 없음');

  useEffect(() => {
    // 유저 이름이 있으면 유저 이름을 설정, 없으면 '이름 없음'유지
    if (user && user.user_metadata && user.user_metadata.name) setUserName(user.user_metadata.name);
  }, [user]);

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut(); // 구글 세션도 만료
    } catch (e) {
      // 구글 로그아웃 실패는 무시 (로그인 안 했을 수도 있음)
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 오류:', error.message);
      Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
    } else {
      navigation.navigate('AuthStack', {screen: 'LogIn'});
    }
  };

  const handleWithdrawal = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          onPress: async () => {
            console.log('회원 탈퇴 진행 시작');
            try {
              const { success, error } = await requestAccountDeletion();

              if (success) {
                console.log('회원 탈퇴 성공');
                Alert.alert('성공', '회원 탈퇴가 완료되었습니다.', [
                  { text: '확인', onPress: async () => {
                      await handleLogout();
                    }
                  }
                ]);

              } else {
                console.error('회원 탈퇴 실패:', error);
                Alert.alert('오류', error?.message || '회원 탈퇴 중 오류가 발생했습니다.');
              }
            } catch (err) {
              console.error('handleWithdrawal 오류:', err);
              Alert.alert('오류', '회원 탈퇴 처리 중 예기치 않은 오류가 발생했습니다.');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  const handleTerms = () => {
    navigation.navigate('TermsAndPolicies');
  };


  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-gray-50">
        <Text className="text-lg text-gray-600 font-p">로그인이 필요합니다.</Text>
      </View>
    );
  }

  const buttons = [
    { text: '약관 및 정책', onPress: handleTerms },
    { text: '로그아웃', onPress: handleLogout },
    { text: '회원탈퇴', onPress: handleWithdrawal },
  ];

  return (
    <Background>
      <View className='flex-1 p-6'>
      {/* 프로필 정보 */}
        <View className='border-b border-gray-200 p-2 '>
          <Text className="text-3xl font-bold text-gray-800 mb-1 font-p">{userName || '이름 없음'}</Text>
          <Text className="text-base text-gray-500 mb-8 font-p">{user.email}</Text>
        </View>
        {/* 버튼 목록 */}
        <View className="flex flex-col">
          {buttons.map((button, index) => (
            <ProfileButton
              key={index}
              text={button.text}
              onPress={button.onPress}
            />
          ))}
        </View>
        </View>
    </Background>
  );
}

export const ProfileButton = ({ text, onPress }:{text:string, onPress:()=>void}) => {
  return (
    <TouchableOpacity
      className="flex-row justify-between items-center py-3 border-b border-gray-200"
      onPress={onPress}
    >
      <Text className="text-base text-gray-600 font-p">{text}</Text>
      <ChevronRight style={{color:'#6b7280'}}/>
    </TouchableOpacity>
  );
};

export default ProfileScreen;