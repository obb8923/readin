import { View, Text, TouchableOpacity } from "react-native";
import GoogleLogo from '../../assets/svgs/GoogleLogo.svg';
import MailIcon from '../../assets/svgs/Mail.svg';
const AuthButton = ({handleLogin, loading, type}: {handleLogin: () => void, loading: boolean, type: 'google' | 'email'}) => {   
    const typeMatch = {
        google: {
            buttonStyle:{
                backgroundColor: '#f2f2f2',
               
            },
            textStyle: 'text-black',
            text: '구글로 시작하기'
        },
        email: {
            buttonStyle: {
                backgroundColor: '#eceef5',
                
            },
            textStyle: '#1B91F3',
            text: '이메일로 시작하기'
        }
    };
  return (
    <TouchableOpacity
            className={`h-12 font-p rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center mb-6 w-full flex-row justify-center`}
            style={{backgroundColor: typeMatch[type].buttonStyle.backgroundColor}}
            onPress={handleLogin} // Google 로그인 함수 연결
            disabled={loading}
          >
            {/* 아이콘 영역 */}
            <View className="absolute left-6">
            {type === 'google' && <GoogleLogo style={{width: 20, height: 20}}/>}
            {type === 'email' && <MailIcon style={{width: 20, height: 20, color: typeMatch[type].textStyle}}/>}
            </View>
            {/* 텍스트 영역 */}
            <Text className={`text-black font-p text-base`}
            style={{color: typeMatch[type].textStyle}}>{typeMatch[type].text}</Text>
          </TouchableOpacity>
  );
};  

export default AuthButton;