import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Scaffold } from '../components/ui';

export default function ModalScreen() {
  const handleClose = () => {
    router.back();
  };

  return (
    <Scaffold withBottomNav={false}>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl font-bold text-[#58E886] mb-8">
          📱 Modal
        </Text>
        <Text className="text-lg text-[#D8DEE9] text-center mb-8">
          This is a modal screen with NO bottom navigation
        </Text>
        
        <TouchableOpacity 
          className="bg-[#58E886] px-8 py-4 rounded-full"
          onPress={handleClose}
        >
          <Text className="text-[#001711] font-bold text-lg">
            Close Modal
          </Text>
        </TouchableOpacity>
      </View>
    </Scaffold>
  );
} 