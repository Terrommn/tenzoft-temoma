import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeOut,
    SlideInDown,
    SlideOutDown,
} from 'react-native-reanimated';

interface TeAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface TeAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: TeAlertButton[];
  onDismiss?: () => void;
}

export const TeAlert: React.FC<TeAlertProps> = ({
  visible,
  title,
  message,
  buttons,
  onDismiss,
}) => {
  const handleButtonPress = (button: TeAlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const getButtonStyles = (style?: string) => {
    switch (style) {
      case 'destructive':
        return {
          background: 'bg-red-500/20 border-red-500/40',
          text: 'text-red-400',
          icon: '#ef4444' as const,
          iconName: 'warning' as const,
        };
      case 'cancel':
        return {
          background: 'bg-gray-500/20 border-gray-500/40',
          text: 'text-gray-400',
          icon: '#9CA3AF' as const,
          iconName: 'close-circle' as const,
        };
      default:
        return {
          background: 'bg-accent-green/20 border-accent-green/40',
          text: 'text-accent-green',
          icon: '#58E886' as const,
          iconName: 'checkmark-circle' as const,
        };
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        className="flex-1 bg-black/50 items-center justify-center px-6"
      >
        <TouchableOpacity
          className="absolute inset-0"
          onPress={onDismiss}
          activeOpacity={1}
        />
        
        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          exiting={SlideOutDown.duration(200)}
          className="bg-dark-primary border-2 border-accent-green/30 rounded-3xl p-6 w-full max-w-sm"
          style={{
            shadowColor: '#58E886',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 16,
          }}
        >
          {/* Header with Icon */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            className="items-center mb-6"
          >
            <View className="w-16 h-16 bg-accent-green/10 rounded-full items-center justify-center mb-4">
              <Ionicons name="alert-circle" size={32} color="#58E886" />
            </View>
            
            <Text className="text-text-contrast text-xl font-bold text-center mb-2">
              {title}
            </Text>
            
            {message && (
              <Text className="text-text-light text-base text-center leading-6">
                {message}
              </Text>
            )}
          </Animated.View>

          {/* Buttons */}
          <Animated.View
            entering={FadeInDown.delay(200)}
            className="space-y-3"
          >
            {buttons.map((button, index) => {
              const buttonStyles = getButtonStyles(button.style);
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleButtonPress(button)}
                  className={`flex-row items-center justify-center px-6 py-4 rounded-2xl border ${buttonStyles.background}`}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={buttonStyles.iconName}
                    size={20}
                    color={buttonStyles.icon}
                  />
                  <Text className={`ml-3 text-lg font-semibold ${buttonStyles.text}`}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Helper function to show TeAlert easily
export const showTeAlert = (props: Omit<TeAlertProps, 'visible' | 'onDismiss'>) => {
  // This would need to be implemented with a global state manager or context
  // For now, just export the component to be used manually
  return props;
};
