import { TamaguiProvider, Theme } from '@tamagui/core';
import { PortalProvider } from '@tamagui/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import '../global.css';
import { tamaguiConfig } from '../tamagui.config';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      // User is not authenticated and not on login page, redirect to login
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // User is authenticated but on login page, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false, animation: 'slide_from_left' }} />
      <Stack.Screen 
        name="modal" 
        options={{ 
          presentation: 'modal',
          headerShown: false 
        }} 
      />
      <Stack.Screen name="categories" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig}>
        <Theme name="dark">
          <PortalProvider>
            <AuthProvider>
              <RootLayoutNav />
            </AuthProvider>
          </PortalProvider>
        </Theme>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
