import { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function RidesScreen() {
  // Your existing states for ride posting
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [phone, setPhone] = useState('');

  // State for available rides
  const [rides, setRides] = useState([]);
  const [userID, setUserID] = useState(null);

  // Fetch user ID once on mount
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

  // Fetch available rides posted by drivers
  const fetchRides = async () => {
    const { data, error } = await supabase
      .from('rides')
      .select('*, ride_signups (rider_id, booked)')
      .eq('posted_by', 'driver');
    if (error) {
      console.error(error);
      Alert.alert('Error fetching rides');
    } else {
      setRides(data);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  // Book a ride (your added code)
  const bookRide = async (rideId) => {
    if (!userID) {
      Alert.alert('Error', 'User not logged in');
      return;
    }
    const { error } = await supabase.from('ride_signups').insert([
      {
        ride_id: rideId,
        rider_id: userID,
      },
    ]);
    if (error) {
      console.error(error);
      Alert.alert('Error booking ride', error.message);
    } else {
      Alert.alert('Ride booked! Waiting for driver approval.');
      fetchRides();
    }
  };

  // Helper: Get booking status of current user for this ride
  const getBookingStatus = (ride) => {
    if (!ride.ride_signups) return null;
    const signup = ride.ride_signups.find((r) => r.rider_id === userID);
    return signup ? signup.booked : null;
  };

  // Your existing postRide code remains unchanged
  const postRide = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user?.id) {
      console.error('User fetch error:', userError);
      alert('You must be logged in to post a ride.');
      return;
    }

    const userID = userData.user.id;
    if (!userID) {
      alert('User not logged in');
      return;
    }
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userID)
      .single();

    if (profileError && !profileData) {
      // Profile not found, create one
      const { error: createProfileError } = await supabase.from('profiles').insert([{ id: userID }]);
      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        alert('Failed to create user profile');
        return;
      }
    }
    const { data, error } = await supabase.from('rides').insert([
      {
        posted_by: 'rider',
        driver_id: userID,
        from_location: from,
        to_location: to,
        date: date,
        time: time,
        available_seats: Number(seats),
        phone: phone,
      },
    ]);
    if (error) {
      console.error(error);
      alert('Error posting ride.');
    } else {
      alert('Ride posted!');
      fetchRides(); // refresh list
      setFrom('');
      setTo('');
      setDate('');
      setTime('');
      setSeats('');
      setPhone('');
    }
  };

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Post a Ride (Rider)</Text>

        {/* Your existing post ride form */}
        <TextInput style={styles.input} placeholder="From" value={from} onChangeText={setFrom} />
        <TextInput style={styles.input} placeholder="To" value={to} onChangeText={setTo} />
        <TextInput style={styles.input} placeholder="Date (e.g., 2025-07-10)" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Time (e.g., 14:30)" value={time} onChangeText={setTime} />
        <TextInput
          style={styles.input}
          placeholder="Number of Passengers"
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

        <Button title="Schedule Ride" onPress={postRide} />

        <Text style={styles.header}>Available Rides</Text>

        <FlatList
          scrollEnabled={false}
          data={rides}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => {
            const status = getBookingStatus(item);
            return (
              <View style={styles.rideCard}>
                <Text>{item.from_location} → {item.to_location}</Text>
                <Text>{item.date} at {item.time}</Text>
                <Text>Seats: {item.available_seats}</Text>
                <Text>Phone: {item.phone || 'N/A'}</Text>

                {/* Show booking status or booking button */}
                {status ? (
                  <Text>Status: {status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                ) : (
                  <Button title="Book Ride" onPress={() => bookRide(item.id)} />
                )}
              </View>
            );
          }}
        />
      </ScrollView>
      {/* Your existing nav bar if any */}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1 },
  container: { padding: 20, paddingBottom: 100 },
  header: { fontSize: 20, fontWeight: '600', marginVertical: 15 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  rideCard: {
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
});