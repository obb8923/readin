import { View } from "react-native";
import { Text } from "@/shared/component/Text";
import { BookType } from "@/shared/type/bookType";
import { Colors } from "@/shared/constant/Colors";
import {DEVICE_WIDTH} from "@constant/normal";

interface BookHorizontalProps extends Pick<BookType, 'id' | 'title' | 'pages' | 'height'> {
  color?: string;
  scale?: number;
}

export const BookHorizontal = ({ title, pages, height, color, scale = 1 }: BookHorizontalProps) => {
  // 스케일을 적용한 책 높이 계산 (가장 높은 책이 DEVICE_WIDTH/2가 되도록)
  const scaledHeight = height * scale;
  
  // 페이지수를 기반으로 두께 계산 (1페이지 = 0.1mm = 0.01cm)
  const bookThickness = pages * 0.1; // cm 단위
  
  // 높이에 비례하여 두께 계산 (원래 비율 유지)
  const bookWidth = scaledHeight;
  const bookHeight = (bookThickness / height) * scaledHeight;
  const bookColor = color || Colors.orange400;
  return (
    <View className="bg-orange400 rounded-md justify-center items-center px-4 overflow-hidden"  style={{
      width: bookWidth,
      height: bookHeight,
      backgroundColor: bookColor,
    }}>
      <Text text={title} className="text-white text-xs font-semibold text-center px-2" numberOfLines={2} />
    </View>
  );
};