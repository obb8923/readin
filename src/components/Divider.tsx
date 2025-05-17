import { View, Text, ViewStyle } from "react-native";

const Divider = ({text, ...props}: {text: string, style?: ViewStyle,className?: string}) => {
  return (
    <View className={`w-full mb-10 flex-row items-center justify-center ${props.className}`} style={props.style}>
    {/* 선 */}
    <View className="absolute top-1/2 left-0 bg-gray-200 w-full h-[1px]" />
    {/* 텍스트 */}
    <View className="bg-background px-4 py-2 rounded-full">
        <Text className="text-gray-500 text-sm font-p">{text}</Text>
    </View>
    </View>
  );
};

export default Divider;