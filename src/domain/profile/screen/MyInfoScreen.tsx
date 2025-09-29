import {Background} from '@component/Background';
import {Alert, ScrollView, TextInput, TouchableOpacity, View, Switch, Platform, Modal, Animated} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {Text} from '@component/Text';
import {AppBar} from '@component/AppBar';
import {useHideTabBar} from '@store/tabStore';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from '@nav/stack/Profile';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, {useCallback, useMemo, useState, useEffect, useRef} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@libs/supabase/supabase';
import { useAuthStore } from '@/shared/store/authStore';
import { Colors } from '@constant/Colors';
import {Button} from '@component/Button';
type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export const MyInfoScreen = () => {
  const hideTabBar = useHideTabBar();
  useFocusEffect(() => {
    hideTabBar();
  });
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { userId, logout } = useAuthStore();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  // 나이 입력 제거됨
  const [gender, setGender] = useState<boolean | null>(null);
  const [birthday, setBirthday] = useState(''); // YYYY-MM-DD
  const [isBirthdayPickerVisible, setBirthdayPickerVisible] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 애니메이션을 위한 ref
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 로딩이 완료되면 페이드인 애니메이션 실행
  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      // 로딩 시작 시 투명도 초기화
      fadeAnim.setValue(0);
    }
  }, [loading, fadeAnim]);

  const isValid = useMemo(() => {
    const emailOk = /.+@.+\..+/.test(email);
    const nameOk = name.trim().length > 0;
    const birthdayOk = /^\d{4}-\d{2}-\d{2}$/.test(birthday);
    // 성별은 '선택하지 않음' 허용
    return emailOk && nameOk && birthdayOk;
  }, [email, name, birthday]);

  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleBirthdayChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setBirthdayPickerVisible(false);
    }
    if (event.type === 'set' && selectedDate) {
      setBirthday(formatDate(selectedDate));
    }
  };

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // 1) auth 사용자 이메일 우선
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email) {
        setEmail(userData.user.email);
      }

      // 2) profiles 테이블에서 확장 정보 로드 (id 또는 user_id 기준)
      const { data, error } = await supabase
        .from('users')
        .select('email,name,age,gender,birthdate,is_marketing_agreed')
        .eq('id', userId)
        .single();

      if (!error && data) {
        if (data.email) setEmail(String(data.email));
        if (data.name) setName(String(data.name));
        // gender를 boolean(true: 남성, false: 여성) 또는 null로 관리
        if (data.gender === null || data.gender === undefined) {
          setGender(null);
        } else if (typeof data.gender === 'boolean') {
          setGender(data.gender);
        } else {
          // 기존 문자열 호환
          const g = String(data.gender);
          if (g === 'male') setGender(true);
          else if (g === 'female') setGender(false);
          else setGender(null);
        }
        if (data.birthdate) setBirthday(String(data.birthdate));
        if (typeof data.is_marketing_agreed === 'boolean') setMarketingConsent(Boolean(data.is_marketing_agreed));
      }
    } catch (e) {
      // noop: 초기 진입 시 실패해도 화면은 표시
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      return undefined;
    }, [fetchProfile])
  );

  const handleSave = () => {
    if (!isValid) {
      Alert.alert('입력 확인', '필수 정보를 올바르게 입력해주세요.');
      return;
    }
    (async () => {
      try {
        if (!userId) {
          Alert.alert('오류', '로그인 상태를 확인해주세요.');
          return;
        }
        // 생년월일 기준 나이 계산
        const computeAge = (birth: string): number | null => {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) return null;
          const [by, bm, bd] = birth.split('-').map(Number);
          const today = new Date();
          let age = today.getFullYear() - by;
          const hasHadBirthdayThisYear = (today.getMonth() + 1 > bm) || ((today.getMonth() + 1 === bm) && (today.getDate() >= bd));
          if (!hasHadBirthdayThisYear) age -= 1;
          return age >= 0 && age < 200 ? age : null;
        };

        const computedAge = birthday ? computeAge(birthday) : null;

        const payload = {
          id: userId,
          email,
          name,
          age: computedAge,
          // gender는 boolean|null 그대로 저장
          gender: gender,
          birthdate: birthday || null,
          is_marketing_agreed: marketingConsent,
          updated_at: new Date().toISOString(),
        } as any;

        const { error } = await supabase
          .from('users')
          .upsert(payload, { onConflict: 'id' });

        if (error) {
          Alert.alert('저장 실패', error.message || '정보 저장 중 오류가 발생했습니다.');
          return;
        }

        Alert.alert('저장 완료', '내 정보가 저장되었습니다.');
        navigation.goBack();
      } catch (e: any) {
        Alert.alert('저장 실패', e?.message || '정보 저장 중 오류가 발생했습니다.');
      }
    })();
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '확인', style: 'destructive', onPress: async () => {
            await logout();
        } },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert('회원 탈퇴', '정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      { text: '탈퇴', style: 'destructive', onPress: async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              // 서버 함수 호출로 안전한 탈퇴 처리(권한 필요). 없다면 사용자 레코드 soft delete 등 처리.
              try {
                await supabase.rpc('delete_user_and_data', { p_user_id: user.id });
              } catch (_) {
                // RPC 미존재 등 오류는 무시하고 계속 진행
              }
            }
            await supabase.auth.signOut();
          } finally {
            navigation.reset({ index: 0, routes: [{ name: 'Login' as any }] });
          }
        } },
    ]);
  };

  return (
    <Background>
      <View className="flex-1">
        <AppBar
          title="내 정보"
          onLeftPress={() => {
            navigation.goBack();
          }}
        />
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text text="정보를 불러오는 중..." type="body2" className="text-gray500 mt-4" />
          </View>
        ) : (
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="mt-4">
            <Text text="이메일" type="caption1" className="text-gray500 mb-2" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="이메일을 입력해주세요"
              placeholderTextColor={Colors.gray700}
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-gray900 text-white rounded-xl px-4 py-3"
            />
          </View>

          <View className="mt-4">
            <Text text="이름" type="caption1" className="text-gray500 mb-2" />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="이름을 입력해주세요"
              placeholderTextColor={Colors.gray700}
              className="bg-gray900 text-white rounded-xl px-4 py-3"
              maxLength={12}
            />
          </View>

          <View className="mt-4">
            <Text text="성별" type="caption1" className="text-gray500 mb-2" />
            <View className="flex-row gap-2">
              {[
                { key: null as boolean | null, label: '선택하지 않음' },
                { key: true as boolean | null, label: '남성' },
                { key: false as boolean | null, label: '여성' },
              ].map(opt => (
                <TouchableOpacity
                  key={String(opt.key)}
                  onPress={() => setGender(opt.key)}
                  className={`px-4 py-2 rounded-xl ${gender === opt.key ? 'bg-white' : 'bg-gray900'}`}
                  activeOpacity={0.7}
                >
                  <Text
                    text={opt.label}
                    type="body3"
                    className={gender === opt.key ? 'text-black' : 'text-white'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mt-4">
            <Text text="생일" type="caption1" className="text-gray500 mb-2" />
            <TouchableOpacity
              onPress={() => setBirthdayPickerVisible(true)}
              activeOpacity={0.7}
              className="bg-gray900 rounded-xl px-4 py-3"
            >
              <Text text={birthday ? birthday : 'YYYY-MM-DD'} type="body2" className={birthday ? 'text-white' : 'text-gray600'} />
            </TouchableOpacity>

            {/* 날짜 선택기 모달 (BookRecordModal 스타일 준용) */}
            <Modal
              visible={isBirthdayPickerVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setBirthdayPickerVisible(false)}
            >
              <View className="flex-1 justify-end bg-black/50">
                <View className="bg-gray800 rounded-t-3xl p-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text text="생일 선택" type="title3" className="text-white" />
                    <TouchableOpacity 
                      onPress={() => setBirthdayPickerVisible(false)}
                      className="bg-gray700 rounded-full p-2"
                      activeOpacity={0.8}
                    >
                      <Text text="완료" type="body2" className="text-white" />
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={birthday ? new Date(birthday) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleBirthdayChange}
                    maximumDate={new Date()}
                    style={{ backgroundColor: 'transparent' }}
                    textColor="white"
                  />
                </View>
              </View>
            </Modal>
          </View>

          <View className="mt-6 flex-row items-center justify-between">
            <Text text="마케팅 정보 수신 동의" type="body2" className="text-white" />
            <Switch
              value={marketingConsent}
              onValueChange={setMarketingConsent}
              trackColor={{ false: Colors.gray600, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <View className="h-6" />
          <Button text="저장" onPress={handleSave} disabled={!isValid} className="bg-primary py-4" />
          
          <View className="my-6 border-b border-gray700" />
          <View className="mb-10 flex-row items-center justify-between">
          <Text text="다른 계정으로 로그인 하고 싶으신가요?" type="caption1" className="text-gray500" />
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
          <Text text="로그아웃하기" type="caption1" className="text-gray500" />
          </TouchableOpacity>
          </View>
          <View className="mb-6 flex-row items-center justify-between">
          <Text text="앞으로 readin을 사용하고 싶지 않으시다면.." type="caption1" className="text-gray500" />
          <TouchableOpacity onPress={handleWithdraw} activeOpacity={0.7}>
          <Text text="탈퇴하기" type="caption1" className="text-gray500" />
          </TouchableOpacity>
          </View>

          <View className="h-10" />

            </ScrollView>
          </Animated.View>
        )}
      </View>
    </Background>
  );
};