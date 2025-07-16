import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ImageBackground, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useBottomNavHeight } from '../../hooks/useBottomNavHeight';

interface ScaffoldProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  avoidBottomNav?: boolean;
}

export const Scaffold: React.FC<ScaffoldProps> = ({
  children,
  title,
  showBack = false,
  onBack,
  rightComponent: right,
  avoidBottomNav = false,
}) => {
  const topPadding = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
  const bottomPadding = useBottomNavHeight(avoidBottomNav);

  return (
    <ImageBackground
      source={require('../../assets/bg.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
      onLoad={() => console.log('Background image loaded successfully')}
      onError={(error) => console.log('Background image failed to load:', error)}
    >
      <View className="flex-1" style={{ paddingTop: topPadding }}>
        {/* Top Bar */}
        {(title || showBack || right) && (
          <View className="flex-row items-center justify-between px-4 py-3" style={{ minHeight: 56 }}>
            {/* Left: Back Arrow */}
            <View style={{ width: 40 }}>
              {showBack && (
                <TouchableOpacity onPress={onBack} hitSlop={10}>
                  <Ionicons name="arrow-back" size={24} color="#58E886" />
                </TouchableOpacity>
              )}
            </View>
            {/* Center: Title */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              {title && (
                <Text className="text-lg font-bold text-[#58E886]" numberOfLines={1}>
                  {title}
                </Text>
              )}
            </View>
            {/* Right: Custom */}
            <View style={{ width: 40, alignItems: 'flex-end' }}>
              {right}
            </View>
          </View>
        )}
        {/* Main Content */}
        <View className="flex-1" style={{ paddingBottom: bottomPadding }}>
          {children}
        </View>
      </View>
    </ImageBackground>
  );
}; 