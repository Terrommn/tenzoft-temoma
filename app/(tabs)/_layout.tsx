import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { AnimatedTabBar } from '../../components/ui';

export default function TabLayout() {

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {[
        { name: 'index', icon: 'wallet' },
        { name: 'chat', icon: 'chatbubble' },
        { name: 'expenses', icon: 'analytics' },
      ].map(({ name, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: '',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                size={28} 
                name={focused ? icon as any : `${icon}-outline` as any} 
                color={color} 
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
} 