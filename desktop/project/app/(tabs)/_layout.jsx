import { Tabs } from 'expo-router';
import { UserPlus, Chrome as Home, Car, MessageCircle, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function TabLayout() {
  const [isSignedUp, setIsSignedUp] = useState(false);

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
        name="index"
        options={{
          title: 'Sign Up',
          tabBarIcon: ({ size, color }) => (
            <UserPlus size={size} color={color} />
          ),
          href: isSignedUp ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
          href: !isSignedUp ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: 'Rides',
          tabBarIcon: ({ size, color }) => (
            <Car size={size} color={color} />
          ),
          href: !isSignedUp ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={size} color={color} />
          ),
          href: !isSignedUp ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
          href: !isSignedUp ? null : undefined,
        }}
      />
    </Tabs>
  );
}