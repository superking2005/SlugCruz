import { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function RidesScreen() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [phone, setPhone] = useState('');

  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [userID, setUserID] = useState(null);

  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterDate, setFilterDate] = useState('');

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

  const applyFilters = async () => {
    setFiltersApplied(true);

    const today = new Date().toISOString().split('T')[0];
    const fromValue = filterFrom.trim();
    const toValue = filterTo.trim();
    const dateValue = filterDate.trim();

    let query = supabase
      .from('rides')
      .select('*, ride_signups (rider_id, booked)')
      .eq('posted_by', 'driver');

    if (fromValue) query = query.ilike('from_location', `%${fromValue}%`);
    if (toValue) query = query.ilike('to_location', `%${toValue}%`);
    if (dateValue) {
      query = query.eq('date', dateValue);
    } else {
      query = query.gte('date', today);
    }

    const { data, error } = await query;
    if (error) {
      console.error(error);
      Alert.alert('Error applying filters');
    } else {
      setFilteredRides(data);
    }
  };

  const clearFilters = () => {
    setFilterFrom('');
    setFilterTo('');
    setFilterDate('');
    setFilteredRides([]);
    setFiltersApplied(false);
  };

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

  const getBookingStatus = (ride) => {
    if (!ride.ride_signups) return null;
    const signup = ride.ride_signups.find((r) => r.rider_id === userID);
    return signup ? signup.booked : null;
  };

  const postRide = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user?.id) {
      alert('You must be logged in to post a ride.');
      return;
    }

    const userID = userData.user.id;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userID)
      .single();

    if (profileError && !profileData) {
      const { error: createProfileError } = await supabase.from('profiles').insert([{ id: userID }]);
      if (createProfileError) {
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
        date,
        time,
        available_seats: Number(seats),
        phone,
      },
    ]);

    if (error) {
      alert('Error posting ride.');
    } else {
      alert('Ride posted!');
      fetchRides();
      setFrom(''); setTo(''); setDate(''); setTime(''); setSeats(''); setPhone('');
    }
  };

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Schedule a Ride (Rider)</Text>
        <TextInput style={styles.input} placeholder="From" value={from} onChangeText={setFrom} />
        <TextInput style={styles.input} placeholder="To" value={to} onChangeText={setTo} />
        <TextInput style={styles.input} placeholder="Date" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Time" value={time} onChangeText={setTime} />
        <TextInput style={styles.input} placeholder="Number of Passengers" value={seats} onChangeText={setSeats} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Button title="Schedule Ride" onPress={postRide} />

        <Text style={styles.header}>Filter Available Rides</Text>
        <TextInput style={styles.input} placeholder="From" value={filterFrom} onChangeText={setFilterFrom} />
        <TextInput style={styles.input} placeholder="To" value={filterTo} onChangeText={setFilterTo} />
        <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={filterDate} onChangeText={setFilterDate} />
        <View style={{ flexDirection: 'row', gap: 10, marginVertical: 10 }}>
          <Button title="Apply Filters" onPress={applyFilters} />
          <Button title="Clear Filters" onPress={clearFilters} color="#888" />
        </View>

        <Text style={styles.header}>Available Rides</Text>
        <FlatList
          scrollEnabled={false}
          data={filtersApplied ? filteredRides : rides}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => {
            const status = getBookingStatus(item);
            return (
              <View style={styles.rideCard}>
                <Text>{item.from_location} → {item.to_location}</Text>
                <Text>{item.date} at {item.time}</Text>
                <Text>Seats: {item.available_seats}</Text>
                <Text>Phone: {item.phone || 'N/A'}</Text>
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
    backgroundColor: '#fff',
  },
  rideCard: {
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fefefe',
  },
});
