import { View, Image, StyleProp, ViewStyle, ImageStyle, TouchableOpacity } from "react-native";
import { BookType } from "@/shared/type/bookType";

interface BookImageProps extends Pick<BookType, 'imageUrl'> {
  className?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const BookImage = ({ imageUrl, className, style, onPress }: BookImageProps) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const content = (
    <View className={`items-start justify-center overflow-hidden w-20 ${className}`}>
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          className="w-full h-full aspect-[2/3] rounded-md"
          resizeMode="cover"
          style={style as StyleProp<ImageStyle>}
        />
      ) : (
        <View className="w-full h-full aspect-[2/3] bg-gray-600 rounded-md">
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};