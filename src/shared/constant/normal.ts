import { Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');

// AsyncStorage 키 상수들
export const STORAGE_KEYS = {
} as const;

export const DEVICE_WIDTH = width;
export const DEVICE_HEIGHT = height;

export const MAIL_ADDRESS = 'companyjeong25@gmail.com';

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.companyjeong.readin&hl=ko';
export const APP_STORE_URL = 'itms-apps://apps.apple.com/app/id6752389566';
