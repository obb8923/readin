import { NativeModules } from 'react-native';

const { AppleSignInModule } = NativeModules as {
  AppleSignInModule?: {
    signInWithApple: () => Promise<{ idToken?: string }>
  }
};

export async function signInWithAppleNative(): Promise<string> {
  if (!AppleSignInModule || typeof AppleSignInModule.signInWithApple !== 'function') {
    throw new Error('AppleSignInModule이 네이티브에 연결되지 않았습니다. iOS 브리지 설정을 확인하세요.');
  }
  const result = await AppleSignInModule.signInWithApple();
  const idToken = result?.idToken;
  if (!idToken) {
    throw new Error('Apple 로그인 idToken을 가져오지 못했습니다.');
  }
  return idToken;
}


