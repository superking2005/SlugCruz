import { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function DriverRidesScreen() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [phone, setPhone] = useState('');
  const [rides, setRides] = useState([]);
  const [userID, setUserID] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        Alert.alert('Error', 'You must be logged in');
        return;
      }
      setUserID(data.user.id);
    };
    fetchUser();
  }, []);

  // Fetch rides posted by this driver, plus any bookings with rider profile info
  const fetchRides = async () => {
    if (!userID) return;
    const { data, error } = await supabase
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
        )
      `)
      .eq('driver_id', userID);
    
    if (error) {
      console.error(error);
      Alert.alert('Error fetching rides');
    } else {
      setRides(data);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [userID]);

  // Post a new ride (driver)
  const postRide = async () => {
    if (!userID) {
      Alert.alert('Error', 'You must be logged in to post a ride.');
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userID)
      .single();

    if (profileError && !profileData) {
      const { error: createProfileError } = await supabase.from('profiles').insert([{ id: userID }]);
      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        Alert.alert('Failed to create user profile');
        return;
      }
    }

    const { error } = await supabase.from('rides').insert([
      {
        posted_by: 'driver',
        driver_id: userID,
        from_location: from,
        to_location: to,
        date,
        time,
        available_seats: Number(seats),
        phone,
      },
    ]);

    if (error) {
      console.error(error);
      Alert.alert('Error posting ride');
    } else {
      Alert.alert('Ride posted!');
      setFrom('');
      setTo('');
      setDate('');
      setTime('');
      setSeats('');
      setPhone('');
      fetchRides();
    }
  };

  // Accept or Reject booking
  const updateBookingStatus = async (signupId, newStatus) => {
    const { data: signupData, error: fetchError } = await supabase
      .from('ride_signups')
      .select('ride_id, rider_id')
      .eq('id', signupId)
      .single();
    
    if (fetchError) {
      console.error(fetchError);
      Alert.alert('Error fetching rider info');
      return;
    }
    
    const { ride_id, rider_id } = signupData;
    const { error: updateError } = await supabase
      .from('ride_signups')
      .update({ booked: newStatus })
      .eq('id', signupId);
    
    if (updateError) {
      console.error(updateError);
      Alert.alert('Error updating booking status');
      return;
    }
    
    // Fetch ride info to include in message
    const { data: rideData, error: rideError } = await supabase
      .from('rides')
      .select('from_location, to_location, date, time')
      .eq('id', ride_id)
      .single();
    
    if (rideError) {
      console.error(rideError);
      Alert.alert('Error fetching ride info');
      return;
    }
    
    // Compose message
    const rideInfo = `${rideData.from_location} → ${rideData.to_location} on ${rideData.date} at ${rideData.time}`;
    const messageBody = `Your ride request was ${newStatus}. Ride details: ${rideInfo}`;
    
    console.log("Inserting message:", {
      sender_id: userID,
      recipient_id: rider_id,
      body: messageBody,
      sent_at: new Date().toISOString(),
    });
    
    const { error: messageError } = await supabase.from('messages').insert([
      {
        sender_id: userID, // the driver
        recipient_id: rider_id,
        body: messageBody,
        sent_at: new Date().toISOString(),
      },
    ]);
    
    if (messageError) {
      console.error("Message insert error:", messageError);
      Alert.alert('Error sending message to rider');
    } else {
      console.log("✅ Message sent successfully!");
    }
    
    Alert.alert(`Booking ${newStatus}`);
    fetchRides();
  };

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Post a Ride (Driver)</Text>

        <TextInput style={styles.input} placeholder="From" value={from} onChangeText={setFrom} />
        <TextInput style={styles.input} placeholder="To" value={to} onChangeText={setTo} />
        <TextInput style={styles.input} placeholder="Date (e.g., 2025-07-10)" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Time (e.g., 14:30)" value={time} onChangeText={setTime} />
        <TextInput
          style={styles.input}
          placeholder="Seats Available"
          value={seats}
          onChangeText={setSeats}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Button title="Post Ride" onPress={postRide} />

        <Text style={styles.header}>Your Rides & Booking Requests</Text>

        <FlatList
          scrollEnabled={false}
          data={rides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.rideCard}>
              <Text style={styles.rideTitle}>{item.from_location} → {item.to_location}</Text>
              <Text>{item.date} at {item.time}</Text>
              <Text>Seats: {item.available_seats}</Text>
              <Text>Phone: {item.phone || 'N/A'}</Text>

              {/* Show booking requests */}
              {item.ride_signups && item.ride_signups.length > 0 ? (
                item.ride_signups.map((signup) => (
                  <View key={signup.id} style={styles.signupCard}>
                    <Text style={styles.riderName}>
                      Rider: {signup.profiles?.full_name || 'Name not available'}
                    </Text>
                    {signup.profiles?.major && (
                      <Text>Major: {signup.profiles.major}</Text>
                    )}
                    {signup.profiles?.college && (
                      <Text>College: {signup.profiles.college}</Text>
                    )}
                    <Text style={[
                      styles.status,
                      { color: signup.booked === 'accepted' ? 'green' : 
                               signup.booked === 'rejected' ? 'red' : 'orange' }
                    ]}>
                      Status: {signup.booked}
                    </Text>
                    {signup.booked === 'pending' && (
                      <View style={styles.buttonRow}>
                        <Button title="Accept" onPress={() => updateBookingStatus(signup.id, 'accepted')} />
                        <View style={{ width: 10 }} />
                        <Button title="Reject" onPress={() => updateBookingStatus(signup.id, 'rejected')} />
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noRequests}>No booking requests yet</Text>
              )}
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { 
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  container: { 
    padding: 20, 
    paddingBottom: 100 
  },
  header: { 
    fontSize: 20, 
    fontWeight: '600', 
    marginVertical: 15,
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    fontSize: 16
  },
  rideCard: {
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  rideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  signupCard: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5
  },
  riderName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10
  },
  noRequests: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#666'
  }
});