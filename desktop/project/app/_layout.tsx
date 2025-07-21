import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ModeProvider } from '../context/ModeContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ModeProvider>
      <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="index" />
        <Stack.Screen name="policy" />
        <Stack.Screen name="signin" />
        <Stack.Screen name="terms" />
      </Stack>
      <StatusBar style="auto" />
      </SafeAreaProvider>
    </ModeProvider>
  );
}