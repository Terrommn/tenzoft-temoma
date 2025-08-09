import React from 'react';
import { Dimensions, Platform, StatusBar, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

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

  React.useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      overlayOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateX.value = withSpring(-DRAWER_WIDTH, { damping: 20, stiffness: 300 });
      overlayOpacity.value = withTiming(0, { duration: 300 });
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
      if (event.translationX < 0) {
        translateX.value = Math.max(-DRAWER_WIDTH, event.translationX);
        overlayOpacity.value = Math.max(0, 0.5 + (event.translationX / DRAWER_WIDTH) * 0.5);
      }
    })
    .onEnd((event) => {
      if (event.translationX < -DRAWER_WIDTH * 0.3 || event.velocityX < -500) {
        translateX.value = withSpring(-DRAWER_WIDTH, { damping: 20, stiffness: 300 });
        overlayOpacity.value = withTiming(0, { duration: 300 });
        runOnJS(onClose)();
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
        overlayOpacity.value = withTiming(0.5, { duration: 300 });
      }
    });

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      {/* Overlay */}
      <Animated.View
        className="absolute inset-0 bg-black"
        style={animatedOverlayStyle}
      >
        <TouchableOpacity
          className="flex-1"
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Drawer */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          className="absolute top-0 left-0 h-full bg-[#001711] border-r border-[#58E886]"
          style={[
            { width: DRAWER_WIDTH, paddingTop: statusBarHeight },
            animatedDrawerStyle,
          ]}
        >
          <View
          className="flex-1"
          >
            {children}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}; 