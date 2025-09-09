
import React from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Background } from "@/shared/component/Background";
import { Text } from "@/shared/component/Text";
import { MenuItem } from "../component/MenuItem";

export const ProfileScreen = () => {
  const handleMenuPress = (menuName: string) => {
    console.log(`${menuName} 메뉴를 눌렀습니다.`);
  };

  return (
    <Background>
      <View className="flex-1">
        {/* 헤더 */}
        <View className="px-6 py-4">
          <Text text="Profile" type="title1" className="text-white" />
        </View>

        {/* 메뉴 리스트 */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* 사용자 정보 섹션 */}
          <View className="mb-6">
            <View className="px-6 py-4">
              <Text text="사용자 정보" type="body2" className="text-gray-400 uppercase tracking-wide" />
            </View>
            <MenuItem
              title="내 정보"
              subtitle="프로필 수정 및 개인정보 관리"
              onPress={() => handleMenuPress('내 정보')}
            />
            <MenuItem
              title="계정 설정"
              subtitle="비밀번호, 이메일 등 계정 관리"
              onPress={() => handleMenuPress('계정 설정')}
            />
            <MenuItem
              title="알림 설정"
              subtitle="푸시 알림 및 이메일 알림 설정"
              onPress={() => handleMenuPress('알림 설정')}
            />
          </View>

          {/* 독서 관련 섹션 */}
          <View className="mb-6">
            <View className="px-6 py-4">
              <Text text="독서 관리" type="body2" className="text-gray-400 uppercase tracking-wide" />
            </View>
            <MenuItem
              title="읽은 책 목록"
              subtitle="완독한 책들의 기록"
              onPress={() => handleMenuPress('읽은 책 목록')}
            />
            <MenuItem
              title="읽고 있는 책"
              subtitle="현재 읽고 있는 책들"
              onPress={() => handleMenuPress('읽고 있는 책')}
            />
            <MenuItem
              title="읽고 싶은 책"
              subtitle="위시리스트 및 읽고 싶은 책들"
              onPress={() => handleMenuPress('읽고 싶은 책')}
            />
            <MenuItem
              title="독서 통계"
              subtitle="월별, 연도별 독서 현황"
              onPress={() => handleMenuPress('독서 통계')}
            />
          </View>

          {/* 앱 설정 섹션 */}
          <View className="mb-6">
            <View className="px-6 py-4">
              <Text text="앱 설정" type="body2" className="text-gray-400 uppercase tracking-wide" />
            </View>
            <MenuItem
              title="테마 설정"
              subtitle="다크/라이트 모드 변경"
              onPress={() => handleMenuPress('테마 설정')}
            />
            <MenuItem
              title="폰트 설정"
              subtitle="글꼴 크기 및 스타일 변경"
              onPress={() => handleMenuPress('폰트 설정')}
            />
            <MenuItem
              title="언어 설정"
              subtitle="앱 언어 변경"
              onPress={() => handleMenuPress('언어 설정')}
            />
          </View>

          {/* 지원 섹션 */}
          <View className="mb-6">
            <View className="px-6 py-4">
              <Text text="지원" type="body2" className="text-gray-400 uppercase tracking-wide" />
            </View>
            <MenuItem
              title="도움말"
              subtitle="자주 묻는 질문 및 사용법"
              onPress={() => handleMenuPress('도움말')}
            />
            <MenuItem
              title="문의하기"
              subtitle="버그 신고 및 개선 제안"
              onPress={() => handleMenuPress('문의하기')}
            />
            <MenuItem
              title="앱 정보"
              subtitle="버전 정보 및 라이선스"
              onPress={() => handleMenuPress('앱 정보')}
            />
          </View>

          {/* 로그아웃 */}
          <View className="px-6 py-4">
            <TouchableOpacity
              onPress={() => handleMenuPress('로그아웃')}
              className="bg-red-600 rounded-lg py-4 items-center"
              activeOpacity={0.7}
            >
              <Text text="로그아웃" type="body1" className="text-white font-semibold" />
            </TouchableOpacity>
          </View>

          {/* 하단 여백 */}
          <View className="h-8" />
        </ScrollView>
      </View>
    </Background>
  );
};