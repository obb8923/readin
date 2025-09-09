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
  return (
    <View className="bg-orange400 rounded-md justify-center items-center px-4 overflow-hidden"  style={{
      width: bookThicknessPx,
      height: bookHeight,
      backgroundColor: bookColor,
    }}>
      <Text text={title} className="text-white text-xs font-semibold text-center px-2" numberOfLines={2} />
    </View>
  );
};