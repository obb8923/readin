import { View, Image } from "react-native";
import { BookType } from "@/shared/type/bookType";

interface BookImageProps extends Pick<BookType, 'imageUrl'> {
  className?: string;
}

export const BookImage = ({ imageUrl, className }: BookImageProps) => {
  return (
    <View className={`items-center justify-center overflow-hidden h-full w-20 ${className}`}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              className="w-full h-full aspect-[2/3] rounded-md"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full aspect-[2/3] bg-gray-600 rounded-md">
            </View>
          )}
        </View>
  )
  
};