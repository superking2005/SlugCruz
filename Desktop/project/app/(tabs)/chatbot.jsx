import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User } from 'lucide-react-native';
import { useMode } from '../../context/ModeContext';
import { supabase } from '../../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API configuration
const GEMINI_CONFIG = {
  API_KEY: 'AIzaSyCCTaVAN7ZY30tasHeaTSyuQU8QGi3xr5Q',
  MODEL: 'gemini-1.5-flash',
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.API_KEY);

export default function ChatbotScreen() {
  const { isDriver } = useMode();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userID, setUserID] = useState(null);
  const [userRides, setUserRides] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const flatListRef = useRef(null);

  // Initial welcome message
  const welcomeMessage = {
    id: 'welcome',
    text: `Hello! I'm your SlugCruz assistant. I can help you with:
    
🚗 Information about your rides and bookings
📋 Details about rides you've posted
❓ General help with the app
🔄 Switching between driver and rider modes

What would you like to know?`,
    isUser: false,
    timestamp: new Date(),
  };

  useEffect(() => {
    setMessages([welcomeMessage]);
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) return;
      
      const userId = userData.user.id;
      setUserID(userId);

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      setUserProfile(profileData);

      // Fetch user's rides (both as driver and rider)
      const { data: ridesData } = await supabase
        .from('rides')
        .select(`
          *,
          ride_signups (
            id,
            rider_id,
            booked,
            profiles!rider_id (
              full_name,
              major,
              college
            )
          ),
          profiles!driver_id (
            full_name,
            major,
            college
          )
        `)
        .or(`driver_id.eq.${userId},ride_signups.rider_id.eq.${userId}`);

      setUserRides(ridesData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const generateChatbotResponse = async (userMessage) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Create context about the user and their rides
      const userContext = `
User Profile:
- Name: ${userProfile?.full_name || 'Not set'}
- Major: ${userProfile?.major || 'Not set'}
- College: ${userProfile?.college || 'Not set'}
- Current Mode: ${isDriver ? 'Driver' : 'Rider'}

User's Rides Data:
${userRides.map(ride => `
- Ride ID: ${ride.id}
- From: ${ride.from_location} to ${ride.to_location}
- Date: ${ride.date} at ${ride.time}
- Posted by: ${ride.posted_by}
- Available seats: ${ride.available_seats}
- Phone: ${ride.phone || 'Not provided'}
- Signups: ${ride.ride_signups?.length || 0} people
${ride.ride_signups?.map(signup => `  - ${signup.profiles?.full_name || 'Unknown'}: ${signup.booked}`).join('\n') || ''}
`).join('\n')}

App Features Context:
- This is SlugCruz, a carpooling app for UCSC students
- Users can switch between Driver and Rider modes
- Drivers can post rides and accept/reject bookings
- Riders can book driver rides or schedule their own rides for drivers to book
- The app has messaging functionality for ride coordination
- Users can filter rides by location and date
`;

      const prompt = `You are a helpful assistant for SlugCruz, a carpooling app for UCSC students. 

${userContext}

User's question: "${userMessage}"

Please provide a helpful, friendly response. If the user asks about their rides, bookings, or app features, use the provided context. If you don't have specific information, guide them on how to find it in the app. Keep responses concise but informative.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating chatbot response:', error);
      return "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await generateChatbotResponse(userMessage.text);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.botMessage
    ]}>
      <View style={styles.messageHeader}>
        {item.isUser ? (
          <User size={16} color="#4570ff" />
        ) : (
          <Bot size={16} color="#F59E0B" />
        )}
        <Text style={styles.messageTime}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={[
        styles.messageText,
        item.isUser ? styles.userMessageText : styles.botMessageText
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={styles.fullScreenContainer}>
      <SafeAreaView style={[styles.container, { backgroundColor: isDriver ? '#ffe077' : '#FEFCE8' }]}>
        <View style={styles.header}>
          <Bot size={24} color="#F59E0B" />
          <Text style={styles.headerTitle}>SlugCruz Assistant</Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me about your rides or the app..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Send size={20} color={(!inputText.trim() || isLoading) ? '#9CA3AF' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Assistant is typing...</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4570ff',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#6B7280',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#1F2937',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    backgroundColor: '#4570ff',
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});