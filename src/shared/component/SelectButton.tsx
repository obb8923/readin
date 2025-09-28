import { TouchableOpacity } from "react-native";
import { Text } from "@component/Text";
export const SelectButton = ({ text, onPress,isSelected, className }: { text: string, onPress: () => void, isSelected: boolean, className: string }) => {
  return (
    <TouchableOpacity onPress={onPress} className={`border border-primary bg-gray700 rounded-full py-2 px-4  justify-center items-center ${isSelected ? 'bg-primary' : 'bg-gray700'} ${className}`}>
      <Text text={text} type="body3" className="text-white text-center" />
    </TouchableOpacity>
  );
};