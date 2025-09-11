import { NativeModules } from 'react-native';

// 디버깅을 위해 사용 가능한 모든 모듈들을 확인
console.log('Available NativeModules:', Object.keys(NativeModules));
console.log('AppleSignInModule:', NativeModules.AppleSignInModule);

const { AppleSignInModule } = NativeModules;

export async function signInWithAppleNative(): Promise<string> {
  if (!AppleSignInModule) {
    throw new Error('AppleSignInModule is not available. Make sure the native module is properly linked.');
  }
  
  const result = await AppleSignInModule.signInWithApple();
  return result.idToken;
} 