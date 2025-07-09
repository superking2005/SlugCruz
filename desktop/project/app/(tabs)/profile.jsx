import { View, Text, Button, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {

  // DRIVER RIDER TOGGLE ------------------------------------------------------------
  const [isDriver, setIsDriver] = useState(false);

  // load saved mode from storage
  useEffect(() => {
    const loadMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('userMode');
        if (savedMode !== null) {
          setIsDriver(savedMode === 'driver');
        }
      } catch (err) {
        console.error('Failed to load mode:', err);
      }
    };
    loadMode();
  }, []);

  // Save mode when toggled
  const toggleMode = async () => {
    const newMode = !isDriver;
    setIsDriver(newMode);
    try {
      await AsyncStorage.setItem('userMode', newMode ? 'driver' : 'rider');
    } catch (err) {
      console.error('Failed to save mode:', err);
    }
  };

  // --------------------------------------------------------------------------------
  return (
        <View style={styles.fullScreenContainer}>
    
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>👤 Profile</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
        {/* Driver Rider toggle -------------------------------------------------*/}
        <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>
              {isDriver ? 'Driver Mode' : 'Rider Mode'}
            </Text>
            <Switch
              value={isDriver}
              onValueChange={toggleMode}
              trackColor={{ false: '#d1d5db', true: '#10b981' }}
              thumbColor={isDriver ? '#047857' : '#f3f4f6'}
            />
          </View>
        {/* Driver Rider toggle -------------------------------------------------*/}
      </View>
    </SafeAreaView>
      <View style={styles.navBar}>
        <View style={styles.navButtonContainer}>
          <Button title="Home" onPress={() => router.push('/home')}/>
        </View>
        <View style={styles.navButtonContainer}>
          <Button title="Messages" onPress={() => router.push('/messages')}/>
        </View>
        <View style={styles.navButtonContainer}>
          <Button title="Rides" onPress={() => router.push('/rides')}/>
        </View>
      </View>
  

</View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFCE8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  toggleContainer:{
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight:'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
});