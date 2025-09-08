import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@/shared/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WebViewScreenProps {
  route: {
    params: {
      url: string;
      title?: string;
    };
  };
}

export const WebViewScreen = ({ route }: WebViewScreenProps) => {
  const navigation = useNavigation();
  const { url } = route.params;
    const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="bg-[#03a9f4] pb-4 px-4 flex-row items-center" style={{ paddingTop: insets.top }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mr-3 flex-row items-center justify-center"
        >
          <Text text="‹ " type="semibold" className="text-white text-3xl" />
          <Text text="뒤로가기" type="semibold" className="text-white text-xl" />

        </TouchableOpacity>
      </View>
      
      {/* WebView */}
      <WebView
        source={{ uri: url }}
        className="flex-1"
        startInLoadingState={true}
        renderLoading={() => (
            <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#03a9f4" />
        </View>
    )}
        onError={(syntheticEvent: any) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </View>
  );
};
