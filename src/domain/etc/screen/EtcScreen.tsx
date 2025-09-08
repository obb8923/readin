import { View, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Background } from "@components/Background" 
import { TabBar } from "@/shared/components/TabBar"
import { Text } from "@/shared/components/Text"
import { EtcStackParamList } from "@/shared/nav/stack/Etc"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

const MenuItem = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="mx-4 my-2 p-4 bg-white/80 rounded-xl shadow-sm border border-blue-100"
    activeOpacity={0.7}
  >
    <View className="flex-row justify-between items-center">
      <Text text={title} type="semibold" className="text-textBlack text-base" />
      <Text text="›" type="semibold" className="text-blue-400 text-xl" />
    </View>
  </TouchableOpacity>
)

export const EtcScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EtcStackParamList>>()

  const handleBackupRestorePress = () => {
    navigation.navigate('BackupRestore')
  }

  const handleInquiryPress = () => {
    navigation.navigate('WebView', {
      url: 'https://docs.google.com/forms/d/1UwFIDg3nLWFeGyZTOcXMOe4Nvoy5z6NtjOu3rtB8RLc/edit',
      title: '건의사항 및 의견 보내기'
    })
  }

  return (
    <Background isStatusBarGap={true} isTabBarGap={true} isImage={2}>
      <TabBar />
      {/* 제목 */}
      <View className="w-full justify-center items-center my-6">
      <Text text="하나일기" type="extrabold" className="text-textBlack text-2xl" />
      </View>
      {/* 메뉴 리스트 */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 84 }}
      >
          {/* <MenuItem 
            title="잠금 설정" 
            onPress={() => handleMenuPress('프로필 설정')} 
          /> */}
          <MenuItem 
            title="백업 및 복원" 
            onPress={handleBackupRestorePress} 
          />
          <MenuItem 
            title="건의사항 및 의견 보내기" 
            onPress={handleInquiryPress} 
          />

      
      </ScrollView>
    </Background>
  )
}