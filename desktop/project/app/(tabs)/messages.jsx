import { View, Text, Button, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMode } from '../../context/ModeContext';

export default function MessagesScreen() {
  // DRIVER RIDER TOGGLE ------------------------------------------------------------
  // this is how the driver rider is determined
  const {isDriver} = useMode();
  // --------------------------------------------------------------------------------
  return (
            <View style={styles.fullScreenContainer}>
    
    {/* added isDriver to determine color of container*/}
    <SafeAreaView style={[styles.container, { backgroundColor: isDriver ? '#ffe077' : '#FEFCE8' }]}>
      <View style={styles.content}>
        <Text style={styles.title}>💬 Messages</Text>
        <Text style={styles.subtitle}>Chat with your carpool buddies</Text>
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
              <Button title="Rides" onPress={() => router.push('/rider')}/>
            </View>
            <View style={styles.navButtonContainer}>
              <Button title="Profile" onPress={() => router.push('/profile')}/>
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
});