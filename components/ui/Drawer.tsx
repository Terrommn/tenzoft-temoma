import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Dimensions, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import { useBottomNavHeight } from '../../hooks/useBottomNavHeight';
import { TeAlert } from './TeAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ visible, onClose, children }) => {
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
  const bottomNavHeight = useBottomNavHeight(true);
  const { signOut } = useAuth();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = async () => {
    onClose(); // Close drawer first
    try {
      const result = await signOut();
      if (!result.success) {
        // Show error with TeAlert
        Alert.alert('Error', result.error || 'Failed to sign out');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  React.useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 300 });
      overlayOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 });
      overlayOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible, overlayOpacity, translateX]);

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow dragging to the left (negative values) to close the drawer
      if (event.translationX < 0) {
        translateX.value = Math.max(-DRAWER_WIDTH, event.translationX);
        overlayOpacity.value = Math.max(0, 0.5 + (event.translationX / DRAWER_WIDTH) * 0.5);
      }
      // Ignore positive translationX values (dragging to the right)
    })
    .onEnd((event) => {
      // Only process the gesture if it was a leftward drag
      if (event.translationX < 0) {
        if (event.translationX < -DRAWER_WIDTH * 0.3 || event.velocityX < -500) {
          translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 });
          overlayOpacity.value = withTiming(0, { duration: 250 });
          runOnJS(onClose)();
        } else {
          translateX.value = withTiming(0, { duration: 200 });
          overlayOpacity.value = withTiming(0.5, { duration: 200 });
        }
      } else {
        // If dragged to the right, just return to open position smoothly
        translateX.value = withTiming(0, { duration: 200 });
        overlayOpacity.value = withTiming(0.5, { duration: 200 });
      }
    });

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      {/* Overlay - Click to close */}
      <TouchableOpacity
        className="absolute inset-0 bg-black"
        style={[animatedOverlayStyle, { flex: 1 }]}
        onPress={onClose}
        activeOpacity={1}
      />

      {/* Drawer */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          className="absolute top-0 left-0 h-full bg-[#001711] border-r border-[#58E886]"
          style={[
            { width: DRAWER_WIDTH, paddingTop: statusBarHeight },
            animatedDrawerStyle,
          ]}
        >
          <View className="flex-1 justify-between">
            {/* Content area */}
            <View className="flex-1">
              {children}
            </View>
            
            {/* Logout button at the bottom */}
            <View 
              className="border-t border-[#58E886]/20 pt-4"
              style={{ paddingBottom: bottomNavHeight + 20 }}
            >
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center px-6 py-4 mx-4 rounded-xl bg-red-500/10 border border-red-500/20"
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={16} color="#ef4444" />
                <Text className="text-red-400 text-medium font-semibold ml-4">
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
      
      {/* Logout Confirmation Alert */}
      <TeAlert
        visible={showLogoutAlert}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowLogoutAlert(false),
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: confirmLogout,
          },
        ]}
        onDismiss={() => setShowLogoutAlert(false)}
      />
    </View>
  );
}; 