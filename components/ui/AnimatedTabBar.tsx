import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Replace empty interface extending with a type alias to satisfy lint rule
export type AnimatedTabBarProps = BottomTabBarProps;

type TabItemProps = {
  index: number;
  tabWidth: number;
  isFocused: boolean;
  translateX: Animated.SharedValue<number>;
  options: BottomTabBarProps['descriptors'][string]['options'];
  onPress: () => void;
  onLongPress: () => void;
};

const TabItem: React.FC<TabItemProps> = ({
  index,
  tabWidth,
  isFocused,
  translateX,
  options,
  onPress,
  onLongPress,
}) => {
  const tabAnimatedStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(
      translateX.value,
      [(index - 1) * tabWidth, index * tabWidth, (index + 1) * tabWidth],
      [0.8, 1.1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale: scaleValue }],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 items-center justify-center py-1.5 px-4"
      style={{ width: tabWidth }}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
    >
      <Animated.View 
        className="items-center justify-center"
        style={tabAnimatedStyle}
      >
        {options.tabBarIcon && 
          options.tabBarIcon({
            focused: isFocused,
            color: isFocused ? '#58E886' : '#626f6a',
            size: 28,
          })
        }
      </Animated.View>
    </Pressable>
  );
};

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { height } = Dimensions.get('window');
  const ratio = height / 812;
  
  const tabBarHeight = Math.max(50, Math.min(80, 60 * ratio));
  const bottomSpacing = height * 0.015; // Reduced from 0.025 to 0.015
  const padding = Math.max(5, Math.min(15, 8 * ratio));

  // Memoize tab width to avoid recalculations
  const TAB_WIDTH = useMemo(() => (width - 40) / state.routes.length, [state.routes.length]);
  
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 15,
      stiffness: 120,
      mass: 1,
    });
  }, [state.index, TAB_WIDTH, translateX]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View 
      className="absolute flex-row left-5 right-5 bg-[#001711D9] rounded-3xl shadow-2xl items-center justify-between"
      style={{ 
        bottom: bottomSpacing,
        height: tabBarHeight,
        paddingBottom: padding,
        paddingTop: padding,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      {/* Animated Indicator */}
      <Animated.View 
        className="absolute bg-[#58E886] rounded-2xl opacity-20 ml-2.5"
        style={[
          indicatorStyle,
          { 
            width: TAB_WIDTH - 20,
            height: tabBarHeight - padding * 2,
          }
        ]} 
      />
      
      {/* Tab Items */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabItem
            key={route.key}
            index={index}
            tabWidth={TAB_WIDTH}
            isFocused={isFocused}
            translateX={translateX}
            options={options}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );
}; 