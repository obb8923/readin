import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, Dimensions, Animated,Image } from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../libs/supabase/supabase';
import { requestAccountDeletion, upsertTodaysReadingLog, getReadingLogsForContributionGraph, ReadingLogDataForGraph, upsertReadingDurationLog } from '../../../libs/supabase/supabaseOperations';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../nav/stack/Profile';
import ChevronRight from '../../../../assets/svgs/ChevronRight.svg';
import { RootStackParamList } from '../../../nav/stack/Root';
import { CompositeScreenProps } from '@react-navigation/native';
import Background from '../../../components/Background';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ContributionGraph } from 'react-native-chart-kit';
import { contributionGraphConfig } from '../../../constants/ContributionGraphConfig';
import ClockPlusIcon from '../../../../assets/svgs/ClockPlus.svg';
import Colors from '../../../constants/Colors';
import Timer from '../../../components/Timer';
import LinearGradient from 'react-native-linear-gradient';
import PlayIcon from '../../../../assets/svgs/Play.svg';
import PauseIcon from '../../../../assets/svgs/Pause.svg';
const screenWidth = Dimensions.get('window').width;
type ProfileProps = NativeStackScreenProps<ProfileStackParamList,'Profile'>;
type RootStackProps = NativeStackScreenProps<RootStackParamList>;
type ProfileScreenProps = CompositeScreenProps<ProfileProps, RootStackProps>

const ProfileScreen=({navigation}: ProfileScreenProps) =>{
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const [userName, setUserName] = useState<string>('이름 없음');
  const [isUpdatingLog, setIsUpdatingLog] = useState(false);
  const [contributionData, setContributionData] = useState<ReadingLogDataForGraph[]>([]);
  const [isLoadingContributionData, setIsLoadingContributionData] = useState(false);
  const [isTodayLogged, setIsTodayLogged] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pause, setPause] = useState(true);
  const [timerTime, setTimerTime] = useState(0);
  const [shouldRefreshTimer, setShouldRefreshTimer] = useState<boolean>(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const modalTranslateYAnim = React.useRef(new Animated.Value(-Dimensions.get('window').height / 2)).current;
  const buttonsTranslateYAnim = React.useRef(new Animated.Value(200)).current;
  const graphOpacityAnim = React.useRef(new Animated.Value(0)).current;
  const todayLoggedOpacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user && user.user_metadata && user.user_metadata.name) setUserName(user.user_metadata.name);
  }, [user]);

  useEffect(() => {
    if (isModalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalTranslateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsTranslateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalTranslateYAnim, {
          toValue: -Dimensions.get('window').height / 2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsTranslateYAnim, {
          toValue: 200,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isModalVisible, fadeAnim, modalTranslateYAnim, buttonsTranslateYAnim]);

  const fetchContributionData = useCallback(async () => {
    if (!user) return;
    setIsLoadingContributionData(true);
    try {
      const logs = await getReadingLogsForContributionGraph();
      setContributionData(logs);
    } catch (error) {
      console.error('Error fetching contribution data:', error);
    } finally {
      setIsLoadingContributionData(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContributionData();
  }, [fetchContributionData]);

  useEffect(() => {
    const todayForLogCheck = new Date();
    todayForLogCheck.setHours(0, 0, 0, 0);

    const todayHasPositiveCountLog = contributionData.some(log => {
      if (!log.date || log.count === undefined) return false;
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === todayForLogCheck.getTime() && log.count > 0;
    });

    setIsTodayLogged(todayHasPositiveCountLog);
  }, [contributionData]);

  useEffect(() => {
    if (!isLoadingContributionData && contributionData && contributionData.length > 0) {
      Animated.timing(graphOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      graphOpacityAnim.setValue(0);
    }
  }, [isLoadingContributionData, contributionData, graphOpacityAnim]);

  useEffect(() => {
    if (!isLoadingContributionData) {
      Animated.timing(todayLoggedOpacityAnim, {
        toValue: 1, 
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      todayLoggedOpacityAnim.setValue(0);
    }
  }, [isLoadingContributionData, todayLoggedOpacityAnim]);

  useEffect(() => {
    if (!contributionData || contributionData.length === 0) {
      setCurrentStreak(0);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hasLogOnDateHelper = (dateToSearch: Date, logs: ReadingLogDataForGraph[]): boolean => {
      const targetTimestamp = dateToSearch.getTime();
      return logs.some((log: ReadingLogDataForGraph) => {
        if (!log.date || log.count === undefined) return false; // 유효한 로그인지 확인
        const log_date_obj = new Date(log.date); // 변수명 변경 (logDate 중복 방지)
        log_date_obj.setHours(0, 0, 0, 0);
        return log_date_obj.getTime() === targetTimestamp && log.count > 0;
      });
    };

    let calculatedStreak = 0;
    if (hasLogOnDateHelper(today, contributionData)) {
      calculatedStreak = 1;
      const previousDate = new Date(today); // 날짜 객체 복사

      // 연속된 이전 날짜들을 확인 (무한 루프, 내부 break로 종료)
      for (let i = 0; true; i++) { 
        previousDate.setDate(previousDate.getDate() - 1); // 하루 전으로 이동
        if (hasLogOnDateHelper(previousDate, contributionData)) {
          calculatedStreak++;
        } else {
          break; // 연속이 끊기면 중단
        }
      }
    }
    setCurrentStreak(calculatedStreak);
  }, [contributionData]); // contributionData가 변경될 때만 재계산

  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말로 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: async () => {
        try {
          await GoogleSignin.signOut();
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
      }}
    ]
  );}
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

  const handleReadToday = async () => {
    setIsUpdatingLog(true);
    try {
      await upsertTodaysReadingLog();
      Alert.alert("독서 기록 완료!", "오늘의 독서 활동이 기록되었습니다!");
      fetchContributionData();
    } catch (error: any) {
      console.error('Error logging reading activity on ProfileScreen:', error);
      Alert.alert("알림", error.message || "독서 활동 기록 중 오류가 발생했습니다.");
    } finally {
      setIsUpdatingLog(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user && !loading) {
    return (
      <Background>
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-lg text-gray-600 font-p">로그인이 필요합니다.</Text>
        </View>
      </Background>
    );
  }

  const buttons = [
    { text: '독서 통계', onPress: () => navigation.navigate('Statistics') },
    { text: '약관 및 정책', onPress: () => navigation.navigate('TermsAndPolicies') },
    { text: '로그아웃', onPress: handleLogout },
    { text: '회원탈퇴', onPress: handleWithdrawal },
  ];

  const openModal = () => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    setTimerTime(0);
    setPause(true);
    setShouldRefreshTimer(true);
    setIsModalVisible(true);
    setTimeout(() => setShouldRefreshTimer(false), 50);
  }

  const closeModal = () => {
    setIsModalVisible(false);
    setPause(true);
    setTimeout(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });
    }, 300);
  }

  const handleSaveAndCloseModal = async () => {
    const minutes = Math.floor(timerTime / (1000 * 60));
    console.log('저장할 독서 시간 (분):', minutes);

    if (minutes > 0) {
      setIsUpdatingLog(true); // 로딩 인디케이터 표시 (선택적)
      try {
        await upsertReadingDurationLog(minutes);
        Alert.alert('저장 완료', `독서 시간 ${minutes}분이 기록되었습니다.`);
        fetchContributionData(); // 데이터 새로고침하여 그래프 및 오늘 독서 여부 업데이트
      } catch (error: any) {
        console.error('Error saving reading duration:', error);
        Alert.alert("오류", error.message || "독서 시간 기록 중 오류가 발생했습니다.");
      } finally {
        setIsUpdatingLog(false);
      }
    } else {
      // Alert.alert("알림", "기록할 독서 시간이 없습니다 (1분 이상부터 기록 가능). ");
    }
    closeModal();
  };

  
  return (
    <Background>
      <View className='flex-1 p-6'>
      {/* 프로필 정보 */}
        <View className='border-b border-gray-200 p-2 '>
          <Text className="text-3xl font-bold text-gray-800 mb-1 font-p">{userName || '이름 없음'}</Text>
          <Text className="text-base text-gray-500 mb-4 font-p">{user?.email}</Text>
        </View>
        {/* 일일 독서 로그 그래프 */}
        <Animated.View className='mt-4 items-center border border-gray-200 rounded-lg mb-4' style={{ opacity: graphOpacityAnim }}>
          <ContributionGraph
            values={contributionData && contributionData.length > 0 ? contributionData : [{date: null, count: null}]}
            endDate={new Date()}
            numDays={Math.min(90, Math.floor((screenWidth - 40) / 4))}
            width={screenWidth - 40}
            height={220}
            gutterSize={2}
            squareSize={20}
            horizontal={true}
            showMonthLabels={true}
            showOutOfRangeDays={false}
            accessor="count"
            getMonthLabel={(monthIndex: number) => {
              return (monthIndex+1).toString()+'월';
            }}
            onDayPress={contributionData && contributionData.length > 0 ? (day: { count: number; date: Date }) => {
              Alert.alert(day.date.toISOString().split('T')[0]);
            } : undefined}
            titleForValue={contributionData && contributionData.length > 0 ? (item: { date: Date; value: number }) => {
              if (!item || !item.date) return '';
              const dateString = item.date.toISOString().split('T')[0];
              return `${dateString.substring(5)}: ${item.value}회`;
            } : undefined}
            tooltipDataAttrs={(value: { date: Date; value: number }) => {
              return {rx: 4,ry: 4};
            }}
            chartConfig={contributionGraphConfig}
          />
           { currentStreak > 0 && (
            <View className='w-full px-4 flex-row items-center justify-between mb-4'>
              <Text className="font-p">{currentStreak}일 연속 독서 중!</Text>
              <View className='flex-row items-center gap-2'>
                <Text className="font-p text-sm">조금 읽음</Text>
                <LinearGradient
                  colors={['#C4DDF1', '#3645AC']}
                  start={{ x: 0.1, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: 60, height: 20, borderRadius: 10 }}
                />
                <Text className="font-p text-sm">오래 읽음</Text>
              </View>
            </View>
          )}
        </Animated.View>
        {/* 오늘 독서 기록 버튼 */}
        <Animated.View className='h-16 flex-row justify-between mb-4' style={{ opacity: todayLoggedOpacityAnim }}>
        <TouchableOpacity
          onPress={handleReadToday}
          disabled={isUpdatingLog || isTodayLogged}
          className="h-full flex-1 bg-skyblue px-4 py-2 rounded-lg items-center justify-center"
          style={{ opacity: (isUpdatingLog || isTodayLogged) ? 0.7 : 1 }}
        >
          {isUpdatingLog ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) :isTodayLogged ? (
            <Text className="text-white font-bold text-base font-p">오늘 독서 완료!</Text>
          ) : (
            <>
            <Text className="text-white font-bold text-base font-p">오늘 독서했나요?</Text>
            <Text className="text-background text-sm font-p">버튼을 눌러서 기록하기</Text>
            </>
          )}
        </TouchableOpacity>
        <View className='w-2'/>
        <TouchableOpacity
          onPress={openModal}
          className="h-full flex-row flex-1 border border-gray-300 p-4 rounded-lg items-center justify-center"
        >
          <ClockPlusIcon style={{color:Colors.svggray, width: 20, height: 20}}/>
          <Text className="ml-2 text-base text-gray-600 font-p">독서 시간 추가하기</Text>
        </TouchableOpacity>
        </Animated.View>
        {/* 메뉴 버튼 목록 (통계,약관,로그아웃,회원탈퇴) */}
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
      {/* modal */}
      {/* 배경 */}
       <Animated.View
       className="absolute flex-1 w-full h-full bg-black/50 items-center justify-start"
       style={{ opacity: fadeAnim }}
       pointerEvents={isModalVisible ? 'auto' : 'none'} // 모달 표시 여부에 따라 터치 이벤트 제어
     >
      {/* 본체 */}
       <Animated.View 
        className="w-full h-[50%] bg-background rounded-b-3xl p-6 items-center justify-center"
        style={{ transform: [{ translateY: modalTranslateYAnim }] }}
       >
        {/* 날짜 */}
     <Text className="text-lg font-p mb-4">{`${new Date().getFullYear()}년 ${String(new Date().getMonth() + 1).padStart(2, '0')}월 ${String(new Date().getDate()).padStart(2, '0')}일 독서 기록`}</Text>
          {/* 타이머 */}
          <Timer 
            recording={!pause}
            onTimeUpdate={setTimerTime}
            shouldRefresh={shouldRefreshTimer}
            setShouldRefresh={setShouldRefreshTimer}
          />
      </Animated.View>
      </Animated.View>
      {/* 버튼들 */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 p-8 flex-row justify-around items-center bg-background rounded-t-3xl  "
        style={{ transform: [{ translateY: buttonsTranslateYAnim }] }}
      >
        <TouchableOpacity onPress={closeModal} className="p-2 items-center justify-center rounded-full w-20 h-20 bg-background border border-brick">
          <Text className="text-base text-brick font-p">취소</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setPause(prev=>!prev)} className="p-2 items-center justify-center rounded-full w-24 h-24 bg-background border border-black">
          {pause ? <PlayIcon style={{color:Colors.black, width: 24, height: 24}}/> : <PauseIcon style={{color:Colors.black, width: 24, height: 24}}/>}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSaveAndCloseModal} className="p-2 items-center justify-center rounded-full w-20 h-20 bg-background border border-skyblue">
          <Text className="text-base text-skyblue font-p">저장</Text>
        </TouchableOpacity>
      </Animated.View>
      
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
      <ChevronRight style={{color:Colors.svggray, width: 20, height: 20}}/>
    </TouchableOpacity>
  );
};

export default ProfileScreen;