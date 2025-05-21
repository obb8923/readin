import { View, ViewStyle,StatusBar } from "react-native"

type BackgroundProps = {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle | ViewStyle[];
}
const Background = ({children,...props}: BackgroundProps) => {
  const statusBarHeight = StatusBar.currentHeight;
  return (
    <View 
    className={`flex-1 bg-background ${props.className}`} 
    style={[props.style, {paddingTop: statusBarHeight}]}>
      {children}
    </View>
  )
}
export default Background;