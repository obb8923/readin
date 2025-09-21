import { View, Image, StyleProp, ViewStyle, ImageStyle } from "react-native";
import { BookType } from "@/shared/type/bookType";

interface BookImageProps extends Pick<BookType, 'imageUrl'> {
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const BookImage = ({ imageUrl, className, style }: BookImageProps) => {
  return (
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
  )
  
};