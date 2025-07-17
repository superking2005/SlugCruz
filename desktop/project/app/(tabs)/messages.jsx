import { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useMode } from '../../context/ModeContext';

export default function MessagesScreen() {
  const { isDriver } = useMode();
  const [messages, setMessages] = useState([]);
  const [userID, setUserID] = useState(null);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return;
      }
      const id = userData.user.id;
      setUserID(id);

      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', id)
        .order('sent_at', { ascending: false });

      if (msgError) {
        console.error("Fetch message error:", msgError);
      } else {
        console.log("Fetched messages:", messagesData);
        setMessages(messagesData);
      }
    };

    fetchUserAndMessages();
  }, []);

  return (
    <View style={styles.fullScreenContainer}>
      <SafeAreaView style={[styles.container, { backgroundColor: isDriver ? '#ffe077' : '#FEFCE8' }]}>
        <View style={styles.content}>
          <Text style={styles.title}>💬 Messages</Text>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.messageCard}>
                <Text style={styles.messageText}>{item.body}</Text>
                <Text style={styles.timestamp}>{new Date(item.sent_at).toLocaleString()}</Text>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1 },
  container: { flex: 1 },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  messageText: { fontSize: 16, color: '#1F2937' },
  timestamp: { fontSize: 12, color: '#6B7280', marginTop: 6 },
});
