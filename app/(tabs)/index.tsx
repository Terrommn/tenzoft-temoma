import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Scaffold } from '../../components/ui';

export default function HomeTab() {
  return (
    <Scaffold withBottomNav={true}>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl font-bold text-[#58E886] mb-4">
          Hello World! 👋
        </Text>
        <Text className="text-lg text-[#D8DEE9] text-center mb-8">
          This screen HAS bottom navigation
        </Text>
        
        <View className="space-y-4">
          <TouchableOpacity 
            className="bg-[#58E886] px-6 py-3 rounded-full"
            onPress={() => router.push('/login')}
          >
            <Text className="text-[#001711] font-bold text-center">
              Go to Login (No Bottom Nav)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-[#003030] border border-[#58E886] px-6 py-3 rounded-full"
            onPress={() => router.push('/modal')}
          >
            <Text className="text-[#58E886] font-bold text-center">
              Open Modal (No Bottom Nav)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Scaffold>
  );
} 