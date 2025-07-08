import { View, Text, Button, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
                    <View style={styles.fullScreenContainer}>


    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🐌 Welcome to UCSC Carpooling!</Text>
        <Text style={styles.subtitle}>Find rides and connect with fellow Banana Slugs</Text>
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
});