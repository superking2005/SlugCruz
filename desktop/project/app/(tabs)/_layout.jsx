import { Tabs } from 'expo-router';
import { Home, Car, Armchair, MessageCircle, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
// Imports from context and safe area provider
import { useMode } from '../../context/ModeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TabLayout() {
  const [isSignedUp, setIsSignedUp] = useState(false);
  const {isDriver} = useMode();
  useFocusEffect(
    useCallback(() => {
      checkSignupStatus();
    }, [])
  );

  const checkSignupStatus = async () => {
    try {
      const signupStatus = await AsyncStorage.getItem('isSignedUp');
      setIsSignedUp(signupStatus === 'true');
    } catch (error) {
      console.error('Error checking signup status:', error);
    }
  };
  return (
    // Wrap the entire app in the SafeAreaProvider
    // _layout.tsx contains the ModeProvider wrapper
    <SafeAreaProvider>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
          href: undefined,
        }}
      />
      <Tabs.Screen
        name="rider"
        options={{
          title: 'Rider',
          tabBarIcon: ({ size, color }) => (
            <Armchair size={size} color={color} />
          ),
          href: !isDriver ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="driver"
        options={{
          title: 'Driver',
          tabBarIcon: ({ size, color }) => (
            <Car size={size} color={color} />
          ),
          href: isDriver ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={size} color={color} />
          ),
          href: undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
          href: undefined,
        }}
      />
    </Tabs>
    </SafeAreaProvider>
  );
}