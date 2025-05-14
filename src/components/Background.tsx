import { View, ViewStyle } from "react-native"

type BackgroundProps = {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle | ViewStyle[];
}
const Background = ({children,...props}: BackgroundProps) => {
  return (
    <View 
    className={`flex-1 bg-background ${props.className}`} 
    style={[props.style]}>
      {children}
    </View>
  )
}
export default Background;