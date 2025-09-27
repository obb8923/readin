import { Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');

// AsyncStorage 키 상수들
export const STORAGE_KEYS = {
} as const;

export const DEVICE_WIDTH = width;
export const DEVICE_HEIGHT = height;

export const MAIL_ADDRESS = 'companyjeong25@gmail.com';

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.companyjeong.readin&hl=ko';
export const APP_STORE_URL = 'https://apps.apple.com/kr/app/readin-%EA%B0%84%ED%8E%B8%ED%95%9C-%EB%8F%85%EC%84%9C-%EA%B8%B0%EB%A1%9D-%EC%8A%B5%EA%B4%80%ED%98%95%EC%84%B1/id6752389566';
