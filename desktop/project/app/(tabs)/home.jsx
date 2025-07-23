import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMode } from '../../context/ModeContext';

export default function HomeScreen() {
  const { isDriver } = useMode();

  return (
    <View style={styles.fullScreenContainer}>
      <SafeAreaView style={[styles.container, { backgroundColor: isDriver ? '#ffe077' : '#FEFCE8' }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>🐌 Welcome to UCSC Carpooling!</Text>
          <Text style={styles.subtitle}>Find rides and connect with fellow Banana Slugs</Text>

          <View style={styles.patchNotesContainer}>
            <Text style={styles.patchTitle}>📋 Release Notes – v1.0.0 (July 22, 2025)</Text>

            <Text style={styles.patchSection}>New Features</Text>
            <Text style={styles.patchText}>• Riders can now book and schedule rides</Text>
            <Text style={styles.patchText}>• Drivers can now accept or reject ride requests scheduled by riders</Text>
            <Text style={styles.patchText}>• Introduced in-app profile editing for users</Text>

            <Text style={styles.patchSection}>Improvements</Text>
            <Text style={styles.patchText}>• Added ride filters for riders and drivers!</Text>
            <Text style={styles.patchText}>• Enhanced message tab for better readability</Text>
            <Text style={styles.patchText}>• Rider/Driver tab UI upgrades</Text>

            <Text style={styles.patchSection}>Bug Fixes</Text>
            <Text style={styles.patchText}>• Fixed a bug where ride status wouldn't update in real-time</Text>
            <Text style={styles.patchText}>• Resolved issue preventing ride filters</Text>
            <Text style={styles.patchText}>• Addressed signup/login prevention issues</Text>

            <Text style={styles.patchSection}>Known Issues</Text>
            <Text style={styles.patchText}>• Signup limits preventing users from joining (fix in progress)</Text>
            <Text style={styles.patchText}>• Layout inconsistencies on certain screens</Text>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  patchNotesContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  patchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
  },
  patchSection: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    color: '#374151',
  },
  patchText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    marginBottom: 4,
  },
});
