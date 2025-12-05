import React, { useEffect, useState } from "react";
import { View, ViewStyle, Platform,Text } from "react-native";
import { NativeAd, NativeAdView, NativeAsset, NativeAssetType, TestIds, NativeAdChoicesPlacement } from "react-native-google-mobile-ads";
import { GOOGLE_MOBILE_ADS_UNIT_ID_NATIVE_ANDROID, GOOGLE_MOBILE_ADS_UNIT_ID_NATIVE_IOS } from '@env';
import { useTrackingStore } from "@store/trackingStore";

type AdmobNativeProps = {
  style?: ViewStyle;
  requestNonPersonalizedAdsOnly?: boolean;
};

const UNIT_ID_NATIVE = 
  __DEV__ ? 
  TestIds.NATIVE : 
  Platform.select({ 
    android: GOOGLE_MOBILE_ADS_UNIT_ID_NATIVE_ANDROID, 
    ios: GOOGLE_MOBILE_ADS_UNIT_ID_NATIVE_IOS 
  }) || TestIds.NATIVE;

export function AdmobNative({
  style,
  requestNonPersonalizedAdsOnly,
}: AdmobNativeProps) {
  const { isTrackingAuthorized } = useTrackingStore();
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const shouldRequestNonPersonalizedAds = requestNonPersonalizedAdsOnly !== undefined 
    ? requestNonPersonalizedAdsOnly 
    : !isTrackingAuthorized;

  useEffect(() => {
    let mounted = true;

    const loadAd = async () => {
      try {
        setLoading(true);
        setError(false);
        const ad = await NativeAd.createForAdRequest(UNIT_ID_NATIVE, {
          requestNonPersonalizedAdsOnly: shouldRequestNonPersonalizedAds,
          // AdChoices 오버레이 위치 설정 (기본값: TOP_RIGHT)
          adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT,
        });
        if (mounted) {
          setNativeAd(ad);
          setLoading(false);
        }
      } catch (err) {
        console.error('[AdmobNativeAd] Failed to load native ad', err);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadAd();

    return () => {
      mounted = false;
      if (nativeAd) {
        nativeAd.destroy();
      }
    };
  }, [shouldRequestNonPersonalizedAds]);

  return (
    <View className="bg-gray800" style={[{ width: "100%" ,height:32,}, style]}>
        {loading || error || !nativeAd ? null :
      <NativeAdView nativeAd={nativeAd} style={{ width: "100%",height:'100%' }}>
        <View className="flex-row w-full h-full justify-start items-center overflow-hidden">
             {/* AD 라벨과 제목 */}
          <View className="flex-row w-full items-center justify-center gap-x-1 ">
            <View className="bg-gray300 rounded px-1">
              <Text className="text-background" style={{fontSize:12,color:'#666'}}>AD</Text>
            </View>
            {nativeAd.headline && (
                <NativeAsset assetType={NativeAssetType.HEADLINE}>
              
                  <Text style={{fontSize:12,color:'#666',fontWeight:'semibold'}}>{nativeAd.headline}</Text>
                </NativeAsset>
            )}
             {/* 액션 버튼 */}
          {nativeAd.callToAction && (
              <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
                  <Text style={{fontSize:12,color:'#666',fontWeight:'semibold'}}>{nativeAd.callToAction + ' >'}</Text>
              </NativeAsset>
          )}
          </View>  
        </View>
      </NativeAdView>
}
    </View>
  );
}
