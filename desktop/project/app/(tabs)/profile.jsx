import { View, Text, Button, StyleSheet } from 'react-native';
import {Switch as CustomSwitch} from 'react-native-switch';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMode} from '../../context/ModeContext';

export default function ProfileScreen() {

  // DRIVER RIDER TOGGLE ------------------------------------------------------------
  const { isDriver, toggleMode } =useMode();

  // --------------------------------------------------------------------------------
  return (
        <View style={[styles.fullScreenContainer ]}>
    
    <SafeAreaView style={[styles.container,{ backgroundColor: isDriver ? '#ffe077' : '#FEFCE8' }]}>
      <View style={styles.content}>
        <Text style={styles.title}>👤 Profile</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
        {/* Driver Rider toggle -------------------------------------------------*/}
        <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>
              {isDriver ? 'Driver Mode' : 'Rider Mode'}
            </Text>
            <CustomSwitch
            value={isDriver}
            onValueChange={toggleMode}
            backgroundActive="#92aaf9ff"
            backgroundInactive="#d1d5db"
            circleActiveColor="#4570ffff"
            circleInActiveColor="#f3f4f6"
            circleSize={26}
            barHeight={28}
            switchWidthMultiplier={2.1}
            switchBorderRadius={18}
            renderActiveText={false}
            renderInActiveText={false}
          />
          </View>
        {/* Driver Rider toggle -------------------------------------------------*/}
      </View>
    </SafeAreaView>
  

</View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
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