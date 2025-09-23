import { View } from "react-native";

export const Dot = ({ active }: { active: boolean }) => (
    <View 
      className="mx-1 rounded-full"
      style={{ width: 8, height: 8, backgroundColor: active ? '#fafafa' : '#4D4D4D' }}
    />
  );