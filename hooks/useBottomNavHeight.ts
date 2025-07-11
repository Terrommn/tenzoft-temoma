import { useWindowDimensions } from 'react-native';

export const useBottomNavHeight = (enabled: boolean = false) => {
  const { height } = useWindowDimensions();
  
  if (!enabled) return 0;
  
  const ratio = height / 812;
  const tabBarHeight = Math.max(50, Math.min(80, 60 * ratio));
  
  // Return just the tab bar height for tight spacing
  return tabBarHeight;
}; 