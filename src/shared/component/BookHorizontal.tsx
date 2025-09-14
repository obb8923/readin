import { View } from "react-native";
import { Text } from "@/shared/component/Text";
import { BookType } from "@/shared/type/bookType";
import { Colors } from "@/shared/constant/Colors";

interface BookHorizontalProps extends Pick<BookType, 'id' | 'title' | 'pages' | 'height' | 'thickness'> {
  color?: string;
  scale?: number;
}

export const BookHorizontal = ({ title, pages, thickness,height, color, scale = 1 }: BookHorizontalProps) => {
  // 스케일을 적용한 너비와 높이 계산
  const bookWidth = height * scale;
  const bookHeight = thickness * scale;
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