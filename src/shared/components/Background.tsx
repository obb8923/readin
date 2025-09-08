import { View, ViewStyle,ImageBackground } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type BackgroundProps = {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle | ViewStyle[];
  isStatusBarGap?: boolean;
  isTabBarGap?: boolean;
  isImage?: 0|1|2;
}
export const Background = ({children,isStatusBarGap=false,isTabBarGap=false,isImage=0,...props}: BackgroundProps) => {
  const insets = useSafeAreaInsets();
  if(isImage===1){
    return (
      <View 
      className={`flex-1 bg-background ${props.className}`} 
      style={{
        paddingTop: isStatusBarGap ? insets.top : 0, 
        paddingBottom: isTabBarGap ? insets.bottom : 0, ...props.style}}>
      <ImageBackground 
      source={require('../../../assets/Background/B1.png')} 
      className="flex-1" 
      >
        {children}
      </ImageBackground>
      </View>
    )
  }
  if(isImage===2){
    return (
      <View 
      className={`flex-1 bg-background ${props.className}`} 
      style={{
        paddingTop: isStatusBarGap ? insets.top : 0, 
        paddingBottom: isTabBarGap ? insets.bottom : 0, ...props.style}}>
        <ImageBackground 
        source={require('../../../assets/Background/B2.png')} 
        className="flex-1" 
        >
          {children}
        </ImageBackground>
      </View>
    )
  }
  return (
    <View 
    className={`flex-1 bg-background ${props.className}`} 
    style={{
      paddingTop: isStatusBarGap ? insets.top : 0, 
      paddingBottom: isTabBarGap ? insets.bottom : 0, ...props.style}}>
        <View className="flex-1">
      {children}
      </View>
    </View>    
  )
}
