import { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function DriverRidesScreen() {
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [riderScheduledRides, setRiderScheduledRides] = useState([]);
  const [userID, setUserID] = useState(null);

  // Post Ride Inputs
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [phone, setPhone] = useState('');

  // Filter Inputs
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
      .eq('driver_id', userID)
      .eq('posted_by', 'driver');

    if (error) {
      console.error(error);
      Alert.alert('Error fetching your rides');
    } else {
      setRides(data);
    }
  };

  // Fetch rides scheduled by riders that drivers can book
  const fetchRiderScheduledRides = async () => {
    const { data, error } = await supabase
      .from('rides')
      .select('*, ride_signups (rider_id, booked)')
      .eq('posted_by', 'rider');
    
    if (error) {
      console.error(error);
      Alert.alert('Error fetching rider scheduled rides');
    } else {
      setRiderScheduledRides(data);
    }
  };

  useEffect(() => {
    fetchRides();
    fetchRiderScheduledRides();
  }, [userID]);

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
        Alert.alert('Failed to create user profile');
        return;
      }
    }

    const { error } = await supabase.from('rides').insert([{
      posted_by: 'driver',
      driver_id: userID,
      from_location: from,
      to_location: to,
      date,
      time,
      available_seats: Number(seats),
      phone,
    }]);

    if (error) {
      console.error(error);
      Alert.alert('Error posting ride');
    } else {
      Alert.alert('Ride posted!');
      setFrom(''); setTo(''); setDate(''); setTime(''); setSeats(''); setPhone('');
      fetchRides();
    }
  };

  // Book a rider's scheduled ride (driver books rider's request)
  const bookRiderScheduledRide = async (rideId) => {
    if (!userID) {
      Alert.alert('Error', 'User not logged in');
      return;
    }
    const { error } = await supabase.from('ride_signups').insert([
      {
        ride_id: rideId,
        rider_id: userID, // In this case, the "rider" is actually the driver
      },
    ]);
    if (error) {
      console.error(error);
      Alert.alert('Error booking rider\'s scheduled ride', error.message);
    } else {
      Alert.alert('Booking request sent! Waiting for rider approval.');
      fetchRiderScheduledRides();
    }
  };

  // Helper: Get booking status for rider's scheduled ride
  const getRiderRideBookingStatus = (ride) => {
    if (!ride.ride_signups) return null;
    const signup = ride.ride_signups.find((r) => r.rider_id === userID);
    return signup ? signup.booked : null;
  };

  const applyFilters = async () => {
    const today = new Date().toISOString().split('T')[0];

    const fromValue = filterFrom.trim();
    const toValue = filterTo.trim();
    const dateValue = filterDate.trim();

    console.log('Apply filters with:', { fromValue, toValue, dateValue });

    let query = supabase.from('rides').select('*');

    if (fromValue) query = query.ilike('from_location', `%${fromValue}%`);
    if (toValue) query = query.ilike('to_location', `%${toValue}%`);
    if (dateValue) {
      query = query.eq('date', dateValue);
    } else {
      // only apply future filter if no specific date given
      query = query.gte('date', today);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      Alert.alert('Error applying filters');
      return;
    }

    console.log('Filtered rides:', data);
    setFilteredRides(data);
  };

  const clearFilters = () => {
    setFilterFrom('');
    setFilterTo('');
    setFilterDate('');
    setFilteredRides([]);
  };

  const updateBookingStatus = async (signupId, newStatus) => {
    const { data: signupData, error: fetchError } = await supabase
      .from('ride_signups')
      .select('ride_id, rider_id')
      .eq('id', signupId)
      .single();

    if (fetchError) return;

    const { ride_id, rider_id } = signupData;
    await supabase
      .from('ride_signups')
      .update({ booked: newStatus })
      .eq('id', signupId);

    const { data: rideData } = await supabase
      .from('rides')
      .select('from_location, to_location, date, time')
      .eq('id', ride_id)
      .single();

    await supabase.from('messages').insert([{
      sender_id: userID,
      recipient_id: rider_id,
      body: `Your ride request was ${newStatus}. Ride: ${rideData.from_location} → ${rideData.to_location} on ${rideData.date} at ${rideData.time}`,
      sent_at: new Date().toISOString(),
    }]);

    Alert.alert(`Booking ${newStatus}`);
    fetchRides();
  };

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Post a Ride</Text>
        <TextInput style={styles.input} placeholder="From" value={from} onChangeText={setFrom} />
        <TextInput style={styles.input} placeholder="To" value={to} onChangeText={setTo} />
        <TextInput style={styles.input} placeholder="Date" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Time" value={time} onChangeText={setTime} />
        <TextInput style={styles.input} placeholder="Seats Available" value={seats} onChangeText={setSeats} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Button title="Post Ride" onPress={postRide} />

        <Text style={styles.header}>Filter Available Rides</Text>
        <TextInput style={styles.input} placeholder="From" value={filterFrom} onChangeText={setFilterFrom} />
        <TextInput style={styles.input} placeholder="To" value={filterTo} onChangeText={setFilterTo} />
        <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={filterDate} onChangeText={setFilterDate} />
        <View style={{ flexDirection: 'row', gap: 10, marginVertical: 10 }}>
          <Button title="Apply Filters" onPress={applyFilters} />
          <Button title="Clear Filters" onPress={clearFilters} color="#888" />
        </View>

        {filteredRides.length > 0 && (
          <>
            <Text style={styles.header}>Available Rides</Text>
            <FlatList
              scrollEnabled={false}
              data={filteredRides}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.rideCard}>
                  <Text style={styles.rideTitle}>{item.from_location} → {item.to_location}</Text>
                  <Text>{item.date} at {item.time}</Text>
                  <Text>Seats: {item.available_seats}</Text>
                  <Text>Phone: {item.phone || 'N/A'}</Text>
                </View>
              )}
            />
          </>
        )}

        {/* New section: Rider Scheduled Rides that drivers can book */}
        <Text style={styles.header}>Rider Scheduled Rides</Text>
        <FlatList
          scrollEnabled={false}
          data={riderScheduledRides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const status = getRiderRideBookingStatus(item);
            return (
              <View style={styles.rideCard}>
                <Text style={styles.rideTitle}>{item.from_location} → {item.to_location}</Text>
                <Text>{item.date} at {item.time}</Text>
                <Text>Passengers: {item.available_seats}</Text>
                <Text>Phone: {item.phone || 'N/A'}</Text>
                
                {status ? (
                  <Text>Booking Status: {status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                ) : (
                  <Button title="Book Ride" onPress={() => bookRiderScheduledRide(item.id)} />
                )}
              </View>
            );
          }}
        />

        <Text style={styles.header}>Your Rides</Text>
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
              {item.ride_signups?.map((signup) => (
                <View key={signup.id} style={styles.signupCard}>
                  <Text style={styles.riderName}>Rider: {signup.profiles?.full_name || 'N/A'}</Text>
                  <Text>Status: {signup.booked}</Text>
                  {signup.booked === 'pending' && (
                    <View style={styles.buttonRow}>
                      <Button title="Accept" onPress={() => updateBookingStatus(signup.id, 'accepted')} />
                      <Button title="Reject" onPress={() => updateBookingStatus(signup.id, 'rejected')} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { padding: 20, paddingBottom: 100 },
  header: { fontSize: 20, fontWeight: '600', marginVertical: 15, color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff',
    padding: 10, marginVertical: 5, borderRadius: 8, fontSize: 16,
  },
  rideCard: {
    marginVertical: 10, padding: 15, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, backgroundColor: '#fff',
  },
  rideTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  signupCard: {
    marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10
  },
  riderName: { fontSize: 15, fontWeight: '600', color: '#333' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
});
