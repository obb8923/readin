import { View } from "react-native";
import { Text } from "@/shared/component/Text";
import { BookType } from "@/shared/type/bookType";
import { Colors, BOOK_COLOR_PALETTE } from "@/shared/constant/Colors";

interface BookHorizontalProps extends Pick<BookType, 'id' | 'title' | 'pages' | 'height' | 'thickness'> {
  scale?: number;
  index?: number;
}

export const BookHorizontal = ({ title, pages, thickness, height, scale = 1, index = 0 }: BookHorizontalProps) => {
  // 스케일을 적용한 너비와 높이 계산
  const bookWidth = Math.max(height * scale, 250); // 최소 250px 보장
  const bookHeight = Math.max(pages * 0.08 * scale, 20); // 최소 200px 보장
  
  // index에 따라 색상 선택 (순환)
  const bookColor = BOOK_COLOR_PALETTE[index % BOOK_COLOR_PALETTE.length];
  
  // index가 홀수면 왼쪽, 짝수면 오른쪽으로 오프셋
  const offsetValue = 15; // 15px 오프셋
  const offset = index % 2 === 0 ? offsetValue : -offsetValue; // 짝수면 오른쪽(+), 홀수면 왼쪽(-)
  
  return (
    <View className="rounded-md justify-center items-center px-4 overflow-hidden"
    style={{
      width: bookWidth,
      height: bookHeight,
      backgroundColor: bookColor,
      marginLeft: offset,
    }}>
      <Text 
      text={title} 
      className="text-white text-xs font-semibold text-center px-2" 
      numberOfLines={2} />
    </View>
  );
};