import { View } from "react-native";
import { Text } from "@/shared/component/Text";
import { BookData } from "@home/component/TowerOfBooks";
import { Colors } from "@/shared/constant/Colors";
export const BookHorizontal = ({ title, thickness, height, color }: BookData) => {
  const bookHeight = height * 2;
  const bookThickness = thickness * 2;
  const bookColor = color || Colors.orange400;
  return (
    <View className="bg-orange400 rounded-md justify-center items-center px-4 overflow-hidden"  style={{
      width: bookHeight,
      height: bookThickness,
      backgroundColor: bookColor,
    }}>
      <Text text={title} className="text-white text-xs font-semibold text-center px-2" numberOfLines={2} />
    </View>
  );
};