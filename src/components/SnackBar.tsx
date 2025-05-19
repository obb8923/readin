import { View, Text, TouchableOpacity } from "react-native";
import { useSnackBarStore } from '../store/snackbarStore';

const SnackBar = () => {
  const { isVisible, text, buttonText, onPress, hide } = useSnackBarStore();
  if (!isVisible) return null;
  return (
    <View className="absolute bottom-16 w-full items-center justify-center">
        {/* 스낵바 몸체 */}
      <View className="w-5/6 bg-bluegray px-6 py-2 flex-row justify-between items-center rounded-md border border-gray-200 border-opacity-50">
      {/* 설명 글 */}
      <View className="flex-1 mr-4">
        <Text className="text-sm font-p">{text}</Text>
        </View>
        {/* 버튼 */}
        <TouchableOpacity
        className=" p-2 rounded-full items-center justify-center"
        onPress={() => { onPress(); hide(); }}
        >
          <Text className="text-skyblue text-sm font-p">{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SnackBar;