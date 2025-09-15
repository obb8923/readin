import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from '@nav/stack/Profile';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppBar } from '@component/AppBar';
import {useTabStore} from '@store/tabStore';
import {Background} from '@component/Background';
import {Colors} from '@constant/Colors';
type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

interface WebviewScreenProps {
  route: {
    params: {
      url: string;
      title?: string;
    };
  };
}

export const WebviewScreen = ({ route }: WebviewScreenProps) => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { url, title } = route.params;
  const { showTabBar } = useTabStore();
 
  return (
    <Background>
    <View className="flex-1 bg-white">
      {/* 헤더 */}
      <AppBar
        title={title}
        onLeftPress={() => {
          navigation.goBack();
          showTabBar();
        }}
      />
      
      {/* WebView */}
      <WebView
        source={{ uri: url }}
        className="flex-1"
        startInLoadingState={true}
        renderLoading={() => (
            <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    )}
        onError={(syntheticEvent: any) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </View>
    </Background>
  );
};
