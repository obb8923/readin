import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Text } from '../../../shared/components/Text';

interface CommentDisplayProps {
  comment?: string;
  isVisible: boolean;
  onClose: () => void;
}

export const CommentDisplay = ({ comment, isVisible, onClose }: CommentDisplayProps) => {
  if (!comment) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 mx-6 max-w-sm w-full">
          {/* 제목 */}
          <View className="items-center mb-4">
            <Text 
              text="✨ AI 코멘트" 
              type="black" 
              className="text-xl font-p-semibold text-text-black"
            />
          </View>
          
          {/* AI 코멘트 내용 */}
          <View className="bg-blue-100 rounded-lg p-4 mb-6">
            <Text 
              text={comment} 
              type="black" 
              className="text-base font-p-regular text-text-black leading-6 text-center"
            />
          </View>
          
          {/* 닫기 버튼 */}
          <TouchableOpacity 
            onPress={onClose}
            className="bg-blue-500 rounded-lg py-3 px-6"
          >
            <Text 
              text="확인" 
              type="semibold" 
              className="text-center text-base font-p-semibold text-white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
