import { useWindowDimensions } from 'react-native';

export const useBottomNavHeight = (enabled: boolean = false) => {
  const { height } = useWindowDimensions();
  
  if (!enabled) return 0;
  
  const ratio = height / 812;
  const tabBarHeight = Math.max(50, Math.min(80, 60 * ratio));
  const bottomSpacing = height * 0.015; // Same spacing used in AnimatedTabBar
  
  // Return tab bar height + bottom spacing + a bit of extra padding for comfortable spacing
  return tabBarHeight + bottomSpacing;
}; 