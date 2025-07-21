import { View, Text, Button, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Switch as CustomSwitch } from 'react-native-switch';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMode } from '../../context/ModeContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Adjust path to your supabase config

export default function ProfileScreen() {
  // DRIVER RIDER TOGGLE ------------------------------------------------------------
  const { isDriver, toggleMode } = useMode();
  const [full_name, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [college, setCollege] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  // Get current user and load profile data on component mount
  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        Alert.alert('Error', 'Failed to get user information');
        return;
      }

      if (!user) {
        Alert.alert('Error', 'No user logged in');
        // Optionally redirect to login screen
        // router.push('/login');
        return;
      }

      setUserId(user.id);

      // Fetch user profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, major, college')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
        return;
      }

      if (data) {
        setFullName(data.full_name || '');
        setMajor(data.major || '');
        setCollege(data.college || '');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!userId) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: full_name.trim(),
          major: major.trim(),
          college: college.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving profile:', error);
        Alert.alert('Error', 'Failed to save profile');
        return;
      }

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <View style={[styles.fullScreenContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4570ffff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.fullScreenContainer]}>
      <SafeAreaView style={[styles.container, { backgroundColor: isDriver ? '#ffe077' : '#FEFCE8' }]}>
        <View style={styles.content}>
          <Text style={styles.title}>👤 Profile</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
          
          {/* Driver Rider toggle */}
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
        </View>
      </SafeAreaView>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              value={full_name}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your major"
              placeholderTextColor="#9CA3AF"
              value={major}
              onChangeText={setMajor}
              autoCapitalize="words"
            />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your college affiliation"
              placeholderTextColor="#9CA3AF"
              value={college}
              onChangeText={setCollege}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={saving ? "Saving..." : "Save Profile"}
            onPress={saveProfile}
            disabled={saving}
            color="#4570ffff"
          />
        </View>
      </View>
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
  toggleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    fontSize: 16,
    color: '#1F2937',
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEFCE8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});