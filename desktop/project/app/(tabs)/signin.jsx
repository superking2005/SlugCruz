import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hlwgpwqdviwtwqnuhyee.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsd2dwd3Fkdml3dHdxbnVoeWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2ODQ5NjIsImV4cCI6MjA2NzI2MDk2Mn0.IefZhUj-LFK7znoAGALJdAKB2FJpOPg-0ZyODYoiXHk'; // Your public anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function LoginScreen() {
  const navigation = useNavigation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@ucsc\.edu$/.test(email);

  const handleLogin = async () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid UCSC email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert('Login Failed', 'Incorrect email or password.');
        } else {
          Alert.alert('Error', error.message);
        }
        return;
      }

      Alert.alert('Success!', 'You are now logged in.');
      // TODO: Navigate to the home screen or dashboard
    } catch (err) {
      Alert.alert('Login Error', err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}>
        <Text style={styles.title}>Sign In to Your Account</Text>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Mail size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter your UCSC email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Lock size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}>
          <LogIn size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Sign In'}</Text>
        </TouchableOpacity>

        {/* Back to Sign Up */}
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <TouchableOpacity onPress={() => navigation.navigate('index')}>
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFCE8',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 18,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  linkText: {
    color: '#F59E0B',
    fontWeight: '600',
  },
});