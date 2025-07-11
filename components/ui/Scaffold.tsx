import React from 'react';
import { ImageBackground, SafeAreaView, View } from 'react-native';
import { useBottomNavHeight } from '../../hooks/useBottomNavHeight';

interface ScaffoldProps {
  children: React.ReactNode;
  withBottomNav?: boolean;
}

export const Scaffold: React.FC<ScaffoldProps> = ({ children, withBottomNav }) => {
  const bottomPadding = useBottomNavHeight(withBottomNav);

  return (
    <ImageBackground
      source={require('../../assets/bg.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1" style={{ paddingBottom: bottomPadding }}>
          {children}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}; 