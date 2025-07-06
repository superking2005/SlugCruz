

import { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase'; 

export default function RidesScreen() {
  // States for driver ride input
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');

  // State for all rides
  const [rides, setRides] = useState([]);

  //  Post a new ride (Driver)
  const postRide = async () => {
    const { data, error } = await supabase.from('rides').insert([
      {
        driver_id: 'driver_123', 
        from_location: from,
        to_location: to,
        date,
        time,
        seats: Number(seats),
      },
    ]);
    if (error) {
      console.error(error);
      alert('Error posting ride.');
    } else {
      alert('Ride posted!');
      fetchRides(); // refresh list
    }
  };

  //  Book a ride (Rider)
  const bookRide = async (rideId) => {
    const { data, error } = await supabase.from('ride_signups').insert([
      {
        ride_id: rideId,
        rider_id: 'rider_456', 
      },
    ]);
    if (error) {
      console.error(error);
      alert('Error booking ride.');
    } else {
      alert('Ride booked!');
    }
  };

  //  Fetch available rides (Rider)
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

      <Button title="Post Ride" onPress={postRide} />

      <Text style={styles.header}>Available Rides</Text>

      <FlatList
        data={rides}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.rideCard}>
            <Text>{item.from_location} → {item.to_location}</Text>
            <Text>{item.date} at {item.time}</Text>
            <Text>Seats: {item.seats}</Text>
            <Button title="Book Ride" onPress={() => bookRide(item.id)} />
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
});
