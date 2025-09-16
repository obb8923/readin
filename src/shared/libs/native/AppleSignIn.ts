import { NativeModules } from 'react-native';

const { AppleSignInModule } = NativeModules;

export async function signInWithAppleNative(): Promise<string> {
  if (!AppleSignInModule) {
    throw new Error('AppleSignInModule is not available. Make sure the native module is properly linked.');
  }
  
  const result = await AppleSignInModule.signInWithApple();
  return result.idToken;
} 