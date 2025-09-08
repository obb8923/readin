import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Background } from '@components/Background';
import { Text } from '@/shared/components/Text';
import { StorageService } from '@/shared/services/storageService';

export const BackupRestoreScreen = () => {
  const navigation = useNavigation();
  const [isRestoreModalVisible, setIsRestoreModalVisible] = useState(false);
  const [isBackupModalVisible, setIsBackupModalVisible] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [backupText, setBackupText] = useState('');

  // 백업 기능
  const handleBackup = async () => {
    try {
      const backupData = await StorageService.exportAllDiaries();
      setBackupText(backupData);
      setIsBackupModalVisible(true);
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '백업 중 오류가 발생했습니다.');
    } 
  };

  // 백업 데이터 복사
  const handleCopyBackup = () => {
    try {
      Clipboard.setString(backupText);
      Alert.alert('완료', '백업 데이터가 클립보드에 복사되었습니다!');
    } catch (error) {
      Alert.alert(
        '복사 실패', 
        '아래 텍스트를 길게 눌러서 전체 선택 후 수동으로 복사해주세요.'
      );
    }
  };

  // 클립보드에서 붙여넣기
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await Clipboard.getString();
      if (clipboardText.trim()) {
        setRestoreText(clipboardText);
        Alert.alert('완료', '클립보드 내용이 붙여넣어졌습니다!');
      } else {
        Alert.alert('알림', '클립보드에 텍스트가 없습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '클립보드에서 읽어오는 중 오류가 발생했습니다.');
    }
  };

  // 복원 기능
  const handleRestore = async (overwrite: boolean = false) => {
    if (!restoreText.trim()) {
      Alert.alert('알림', '복원할 데이터를 입력해주세요.');
      return;
    }

    try {
      const result = await StorageService.importDiaries(restoreText, overwrite);
      
      setIsRestoreModalVisible(false);
      setRestoreText('');
      
      Alert.alert(
        '복원 완료',
        `성공: ${result.success}개\n건너뜀: ${result.skipped}개\n오류: ${result.errors}개`
      );
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '복원 중 오류가 발생했습니다.');
    }
  };

  // 복원 확인 (덮어쓰기 옵션)
  const handleRestoreConfirm = () => {
    Alert.alert(
      '복원 방식 선택',
      '기존 일기와 날짜가 겹치는 경우 어떻게 하시겠습니까?',
      [
        {
          text: '건너뛰기',
          onPress: () => handleRestore(false),
        },
        {
          text: '덮어쓰기',
          onPress: () => handleRestore(true),
          style: 'destructive',
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ]
    );
  };

  const backupModal = () => {
      /* 백업 결과 모달 */

    return (
  <Modal
  visible={isBackupModalVisible}
  animationType="slide"
  presentationStyle="pageSheet"
>
  <View className="flex-1 bg-white mb-8">
    <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
      <Text text="백업 데이터" type="semibold" className="text-textBlack text-lg" />
      <TouchableOpacity onPress={() => setIsBackupModalVisible(false)}>
        <Text text="닫기" type="regular" className="text-gray-500" />
      </TouchableOpacity>
    </View>
    
    <ScrollView className="flex-1 p-4 bg-r">
    <View className="flex-row justify-between items-center mb-3">
            <Text 
              text="아래 텍스트를 복사해서 저장해주세요." 
              type="regular" 
              className="text-textBlack flex-1" 
            />
            <TouchableOpacity
              onPress={() => Alert.alert(
                '복사 방법', 
                '텍스트를 길게 눌러서 전체 선택 후 복사하거나 아래 \'복사하기\'버튼을 눌러 복사하세요'
              )}
              className="ml-2 bg-blue-500 px-3 py-1 rounded"
            >
              <Text text="도움말" type="regular" className="text-white text-sm" />
            </TouchableOpacity>
          </View>
      <TextInput
        value={backupText}
        multiline
        selectTextOnFocus
        className="flex-1 border border-gray-300 rounded-lg p-3 text-xs font-mono bg-gray-50"
        style={{ minHeight: 400 }}
      />
    </ScrollView>
    
    <View className="p-4 border-t border-gray-200">
    <TouchableOpacity
            onPress={handleCopyBackup}
            className="bg-blue-500 p-4 rounded-xl "
            disabled={!backupText.trim()}
          >
            <Text 
              text="복사하기" 
              type="black" 
              className={`text-center text-background`} 
            />
          </TouchableOpacity>
    </View>
  </View>
</Modal>
    )
  }
  const restoreModal = () => {
    return (
      /* 복원 입력 모달 */
      <Modal
      visible={isRestoreModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white mb-8">
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <Text text="일기 복원" type="semibold" className="text-textBlack text-lg" />
          <TouchableOpacity onPress={() => setIsRestoreModalVisible(false)}>
            <Text text="닫기" type="regular" className="text-gray-500" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text 
              text="백업된 JSON 데이터를 아래에 붙여넣으세요:" 
              type="regular" 
              className="text-textBlack flex-1" 
            />
            <TouchableOpacity
              onPress={handlePasteFromClipboard}
              className="ml-2 bg-blue-500 px-3 py-1 rounded"
            >
              <Text text="붙여넣기" type="regular" className="text-white text-sm" />
            </TouchableOpacity>
          </View>
          <TextInput
            value={restoreText}
            onChangeText={setRestoreText}
            multiline
            placeholder="여기에 백업 데이터를 붙여넣으세요..."
            className="flex-1 border border-gray-300 rounded-lg p-3 text-xs font-mono"
            style={{ minHeight: 300 }}
          />
        </View>
        
        <View className="p-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={handleRestoreConfirm}
            className="bg-blue-500 p-4 rounded-xl "
            disabled={!restoreText.trim()}
          >
            <Text 
              text="복원하기" 
              type="black" 
              className={`text-center text-background`} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    )
  }
  return (
    <Background isStatusBarGap={true} isTabBarGap={false} isImage={2}>
         {/* 헤더 탭바 */}
         <View className="flex-row items-center justify-between px-4 py-4 bg-white">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Text text="‹ " type="semibold" className="text-textBlack text-xl" />
            <Text text="뒤로가기" type="semibold" className="text-textBlack text-xl" />
          </TouchableOpacity>
                  
          <View className="w-8" />
        </View>
      <View className="flex-1 pt-12">
       

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* 설명 영역 */}
          <View className="mb-6 p-4 bg-background/80 rounded-xl">
            <Text 
              text={`앱에 저장된 내용을 한눈에 볼 수 있는 텍스트 형태의 파일로 저장하거나 불러올 수 있는 기능입니다.

백업하기: 지금 앱에 있는 데이터를 텍스트로 변환해 복사·저장할 수 있어요.

복원하기: 이전에 저장해둔 텍스트를 붙여넣으면 데이터를 다시 불러올 수 있어요.

이 기능을 사용하면 기기를 바꾸거나 앱을 다시 설치해도 데이터를 쉽게 옮길 수 있어요.`}
              type="regular" 
              className="text-textBlack mb-2" 
            />

            <Text 
              text="💡 백업 데이터는 카카오톡, 메모장 등으로 안전하게 보관하세요" 
              type="regular" 
              className="text-gray-600 text-sm" 
            />
          </View>
           {/* 백업 버튼 영역 */}
            <View className="flex-row justify-between items-center">         
            <TouchableOpacity
                onPress={handleBackup}
                className=" p-4 bg-white/80 rounded-xl shadow-sm border border-blue-100 flex-1"
                activeOpacity={0.7}
            >
                <Text text="백업하기" type="semibold" className="text-black text-center text-xl " />
            </TouchableOpacity>
            <View className="w-4"/>
            <TouchableOpacity
                onPress={() => setIsRestoreModalVisible(true)}
                className=" p-4 bg-white/80 rounded-xl shadow-sm border border-blue-100 flex-1"
                activeOpacity={0.7}
            >
                <Text text="복원하기" type="semibold" className="text-black text-center text-xl" />
            </TouchableOpacity>
            </View>
        </ScrollView>

      
        {backupModal()}
        {restoreModal()}
      </View>
    </Background>
  );
};
