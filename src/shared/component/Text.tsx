import {Text as RNText, TextStyle} from 'react-native';

export type TypographyType = 
  | 'title1' | 'title2' | 'title3' | 'title4'
  | 'body1' | 'body2' | 'body3' 
  | 'caption1'
  | 'handwriting';

export type TextProps = {
    text: string;
    type?: TypographyType;
    className?: string;
    style?: TextStyle | TextStyle[];
    numberOfLines?: number;
  };

const getTypographyStyle = (type: TypographyType): TextStyle => {
  switch(type){
    case 'title1':
      return {
        fontFamily: 'Pretendard-Black',
        fontSize: 28,
        lineHeight: 28 * 1.4, // 140%
        letterSpacing: -0.7, // -2.5%
      };
    case 'title2':
      return {
        fontFamily: 'Pretendard-SemiBold',
        fontSize: 28,
        lineHeight: 28 * 1.4,
        letterSpacing: -0.7,
      };
    case 'title3':
      return {
        fontFamily: 'Pretendard-Black',
        fontSize: 22,
        lineHeight: 22 * 1.4,
        letterSpacing: -0.55,
      };
    case 'title4':
      return {
        fontFamily: 'Pretendard-Black',
        fontSize: 18,
        lineHeight: 18 * 1.4,
        letterSpacing: -0.45,
      };
    case 'body1':
      return {
        fontFamily: 'Pretendard-Regular',
        fontSize: 18,
        lineHeight: 18 * 1.4,
        letterSpacing: -0.45,
      };
    case 'body2':
      return {
        fontFamily: 'Pretendard-Regular',
        fontSize: 16,
        lineHeight: 16 * 1.4,
        letterSpacing: -0.4,
      };
    case 'body3':
      return {
        fontFamily: 'Pretendard-Regular',
        fontSize: 15,
        lineHeight: 15 * 1.4,
        letterSpacing: -0.375,
      };
    case 'caption1':
      return {
        fontFamily: 'Pretendard-Regular',
        fontSize: 12,
        lineHeight: 12 * 1.4,
        letterSpacing: -0.3,
      };
    case 'handwriting':
      return {
        fontFamily: 'KyoboHandwriting2019',
        fontSize: 16,
        lineHeight: 16 * 1.4,
      };
    default:
      return {
        fontFamily: 'Pretendard-Regular',
        fontSize: 16,
        lineHeight: 16 * 1.4,
        letterSpacing: -0.4,
      };
  }
}
export const Text = ({text, type='body2', ...props}: TextProps) => {
  return (
    <RNText 
      {...props}
      className={props.className}
      style={[getTypographyStyle(type), props.style]}
      numberOfLines={props.numberOfLines}>
      {text}
    </RNText>
  );
};
