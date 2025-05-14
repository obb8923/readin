import { TouchableOpacity, Text, ViewStyle, TextStyle, DimensionValue } from 'react-native';
import Colors from '../constants/Colors';
interface DefaultButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  width?: DimensionValue;
  className?: string;
  type?:'normal'|'info'|'delete';
}

const DefaultButton= ({
  title,
  onPress,
  disabled = false,
  loading = false,
  type='normal',
  ...props
}: DefaultButtonProps) => {
    const textColor = type === 'normal' ? Colors.skyblue : type === 'info' ? Colors.black : Colors.brick;
  return (
    <TouchableOpacity
      className={`${props.className} `}
      onPress={onPress}
      style={[{width: 'auto', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center'}, props.style]}
      disabled={disabled || loading}
    >
     
    <Text style={[{color: disabled ? '#6B7280' : textColor, fontSize: 18,textAlign: 'center', fontFamily: 'Pretendard-Regular'}, props.textStyle]}>{title}</Text>
     
    </TouchableOpacity>
  );
};

export default DefaultButton;
