import { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';


export default function RidesScreen() {
  // States for driver ride input
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [phone, setPhone] = useState('');

  // State for all rides
  const [rides, setRides] = useState([]);

  // Post a new ride (Driver)
  const postRide = async () => {
    const { data, error } = await supabase.from('rides').insert([
      {
        driver_id: 'driver_123', // static ID for now
        from_location: from,
        to_location: to,
        date,
        time,
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

  // Book a ride (Rider)
  const bookRide = async (rideId) => {
    const { data, error } = await supabase.from('ride_signups').insert([
      {
        ride_id: 'rideId',
        rider_id: 'rider_456', // static ID for now
      },
    ]);
    if (error) {
      console.error(error);
      alert('Error booking ride.');
    } else {
      alert('Ride booked!');
    }
  };

  // Fetch available rides (Rider)
  const fetchRides = async () => {
    const { data, error } = await supabase.from('rides').select('*');
    if (error) {
      console.error(error);
    } else {
      setRides(data);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  return (
    // ✅ Wrap everything in a View with flex: 1 to contain both the content and the nav bar
    <View style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Post a Ride (Rider)</Text>

        <TextInput style={styles.input} placeholder="From" value={from} onChangeText={setFrom} />
        <TextInput style={styles.input} placeholder="To" value={to} onChangeText={setTo} />
        <TextInput style={styles.input} placeholder="Date (e.g., 2025-07-10)" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Time (e.g., 14:30)" value={time} onChangeText={setTime} />
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
          // Using scrollEnabled={false} can help if you experience nested scroll issues,
          // but it's often not necessary with this layout.
          scrollEnabled={false}
          data={rides}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <View style={styles.rideCard}>
              <Text>{item.from_location} → {item.to_location}</Text>
              <Text>{item.date} at {item.time}</Text>
              <Text>Seats: {item.seats}</Text>
              <Text>Phone: {item.phone || 'N/A'}</Text>
              <Button title="Book Ride" onPress={() => bookRide(item.id)} />
            </View>
          )}
        />
      </ScrollView>

      {/* ✅ New Navigation Bar at the bottom */}
      <View style={styles.navBar}>
        <View style={styles.navButtonContainer}>
          <Button title="Home" onPress={() => router.push('/home')}/>
        </View>
        <View style={styles.navButtonContainer}>
          <Button title="Messages" onPress={() => router.push('/messages')}/>
        </View>
        <View style={styles.navButtonContainer}>
          <Button title="Profile" onPress={() => router.push('/profile')}/>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ✅ New style to ensure the main view takes up the whole screen
  fullScreenContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
    // ✅ Add padding to the bottom to ensure last item is not hidden behind the nav bar
    paddingBottom: 100,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 15,
  },
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
  // ✅ Styles for the new navigation bar
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#f8f8f8',
    // These position it at the bottom of the parent View
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  // ✅ Wrapper for each button to help with layout
  navButtonContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
});