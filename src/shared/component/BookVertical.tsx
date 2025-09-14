import { View } from "react-native";
import { Text } from "@/shared/component/Text";
import { BookType } from "@/shared/type/bookType";
import { Colors } from "@/shared/constant/Colors";

interface BookVerticalProps extends Pick<BookType, 'id' | 'title' | 'pages' | 'height'> {
  color?: string;
}

export const BookVertical = ({ title, pages, height, color }: BookVerticalProps) => {
  // 페이지수를 기반으로 두께 계산 (1페이지 = 0.1mm = 0.01cm)
  const bookThickness = pages * 0.1; // cm 단위
  
  const bookHeight = height * 2;
  const bookThicknessPx = bookThickness * 2;
  const bookColor = color || Colors.orange400;
  
  // 텍스트를 글자 단위로 분리
  const characters = title.split('');
  
  return (
    <View 
    className="bg-orange400 rounded-md justify-center items-center overflow-hidden"
    style={{
      width: bookThicknessPx,
      height: bookHeight,
      backgroundColor: bookColor,
    }}>
      <View 
        className="items-center justify-start overflow-hidden"
        style={{
          height: bookHeight * (11/12),
        }}
      >
        {characters.map((char, index) => (
          <Text 
            key={index}
            text={char} 
            className="text-white font-semibold text-center" 
            style={{
              fontSize: 16,
              lineHeight: 18.4,
              width: bookThicknessPx - 4, // 패딩 고려
              textAlign: 'center',
            }}
          />
        ))}
      </View>
    </View>
  );
};