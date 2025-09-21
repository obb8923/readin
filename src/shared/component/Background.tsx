import { View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { TAB_BAR_HEIGHT } from '@constant/tab'

type BackgroundProps = {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle | ViewStyle[];
  isStatusBarGap?: boolean;
  isTabBarGap?: boolean;
  isBottomGap?: boolean;
}
export const Background = ({children,isStatusBarGap=true,isTabBarGap=false,isBottomGap=true,...props}: BackgroundProps) => {
  const insets = useSafeAreaInsets();
 
  return (
    <View 
    className={`flex-1 bg-background ${props.className}`} 
    style={{
      paddingTop: isStatusBarGap ? insets.top : 0,
      paddingBottom: isTabBarGap ? insets.bottom + TAB_BAR_HEIGHT : (isBottomGap ? insets.bottom : 0),
      ...props.style}}>
        <View className="flex-1">
      {children}
      </View>
    </View>    
  )
}
