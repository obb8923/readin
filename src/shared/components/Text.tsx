import {Text as RNText, TextStyle} from 'react-native';
export type TextProps = {
    text: string;
    type: 'regular' | 'semibold' | 'extrabold' | 'black' | 'kb2019' | 'kb2023';
    className?: string;
    style?: TextStyle | TextStyle[];
    numberOfLines?: number;
  };
const fontStyle = (type: 'regular' | 'semibold' | 'extrabold' | 'black' | 'kb2019' | 'kb2023'): TextStyle => {
  switch(type){
    case 'regular':
      return {
        fontFamily: 'Pretendard-Regular',
      };
    case 'semibold':
      return {
        fontFamily: 'Pretendard-SemiBold',
      };
    case 'extrabold':
      return {
        fontFamily: 'Pretendard-ExtraBold',
      };
    case 'black':
      return {
        fontFamily: 'Pretendard-Black',
      };
    case 'kb2019':
      return {
        fontFamily: 'KyoboHandwriting2019',
      };
    case 'kb2023':
      return {
        fontFamily: 'KyoboHandwriting2023wsa',
      };
    default:
      return {
        fontFamily: 'Pretendard-Regular',
      };
  }
}
export const Text = ({text, type='regular', ...props}: TextProps) => {
  return (
    <RNText 
    {...props}
      className={props.className}
      style={[fontStyle(type), props.style]}
      numberOfLines={props.numberOfLines}>
      {text}
    </RNText>
  );
};
