import {View, Text} from 'react-native';
import {useEffect, useState} from 'react';
import {useInterval} from '../libs/hooks/useInterval'

type TimerProps = {
  recording: boolean; // 녹음 중 여부를 따져 타이머를 시작시키기 위함
  onTimeUpdate?: (elapsedTime: number) => void; // 경과 시간을 전달하기 위한 콜백 추가
  shouldRefresh?: boolean; // 리프레시 상태를 받는 prop 추가
  setShouldRefresh?: (shouldRefresh: boolean) => void; // 리프레시 상태를 설정하기 위한 콜백 추가
};

const Timer = ({
  recording,
  onTimeUpdate,
  shouldRefresh,
  setShouldRefresh,
}: TimerProps) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isStopped, setIsStopped] = useState(false);

  useEffect(() => {
    if (recording) {
      setStartTime(new Date(new Date().getTime() - elapsedTime));
      setIsStopped(false);
    } else {
      // recording이 false가 되면 타이머를 멈추고 싶다면 startTime을 null로 설정하거나
      // isStopped를 true로 설정할 수 있습니다. 현재 로직에서는 useInterval의 dependency에 의해
      // recording이 false가 되면 인터벌이 멈추도록 되어있습니다.
      // 명시적으로 정지 상태를 관리하고 싶다면 아래 주석 해제
      // setStartTime(null); // 또는 setIsStopped(true);
    }
  }, [recording]);

  const refreshTimer = () => {
    setStartTime(null);
    setElapsedTime(0);
    setIsStopped(false);
    setShouldRefresh?.(false);
  };

  useEffect(() => {
    if (shouldRefresh) {
      console.log('refreshTimer');
      refreshTimer();
    }
  }, [shouldRefresh, refreshTimer]);

  useInterval(
    () => {
      if (startTime && !isStopped) { // recording이 true일 때만 startTime이 설정됨
        const now = new Date();
        const currentElapsedTime = now.getTime() - startTime.getTime();
        setElapsedTime(currentElapsedTime);
        onTimeUpdate?.(currentElapsedTime);
      }
    },
    recording && !isStopped ? 10 : null, // recording이 false이거나 isStopped가 true이면 인터벌 중지
  );

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    return {
      hoursMinutes: `${hh}:${mm}`,
      seconds: ss,
    };
  };

  const timeParts = formatTime(elapsedTime);

  return (
    <View className="w-full h-20 justify-center items-center flex-row items-baseline">
      <View className="w-10"/>
      <Text className="text-6xl text-black font-p">
        {timeParts.hoursMinutes}
      </Text>
      <Text className="text-2xl text-svggray font-p w-10">
        {timeParts.seconds}
      </Text>
    </View>
  );
};

export default Timer;