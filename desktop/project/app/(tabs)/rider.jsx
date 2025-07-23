import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function RidesScreen() {
  // States for posting/scheduling rides
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [phone, setPhone] = useState('');

  // State for available rides (posted by drivers)
  const [driverRides, setDriverRides] = useState([]);
  // State for rider's own scheduled rides
  const [myScheduledRides, setMyScheduledRides] = useState([]);
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
  const fetchDriverRides = async () => {
    const { data, error } = await supabase
      .from('rides')
      .select('*, ride_signups (rider_id, booked)')
      .eq('posted_by', 'driver');
    if (error) {
      console.error(error);
      Alert.alert('Error fetching rides');
    } else {
      setDriverRides(data);
    }
  };

  // Fetch rider's own scheduled rides with driver signups
  const fetchMyScheduledRides = async () => {
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
      .eq('posted_by', 'rider')
      .eq('driver_id', userID); // driver_id is used as the poster's ID for rider posts

    if (error) {
      console.error(error);
      Alert.alert('Error fetching your scheduled rides');
    } else {
      setMyScheduledRides(data);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userID) {
        fetchDriverRides();
        fetchMyScheduledRides();
      }
    }, [userID])
  );

  // Book a driver's ride
  const bookDriverRide = async (rideId) => {
    if (!userID) {
        Alert.alert('Error', 'User not logged in');
        return;
    }

    // Insert booking request
    const { data: signupData, error: signupError } = await supabase
        .from('ride_signups')
        .insert([
        {
            ride_id: rideId,
            rider_id: userID,
        },
        ])
        .select()
        .single(); // get inserted row

    if (signupError) {
        console.error('Error booking ride:', signupError);
        Alert.alert('Error booking ride', signupError.message);
        return;
    }

    // Fetch ride info to get driver's ID and ride details
    const { data: rideData, error: rideError } = await supabase
        .from('rides')
        .select('driver_id, from_location, to_location, date, time')
        .eq('id', rideId)
        .single();

    if (rideError || !rideData) {
        console.error('Error fetching ride info:', rideError);
        Alert.alert('Booking succeeded, but failed to notify driver.');
        fetchDriverRides();
        return;
    }

    // Send message to driver
    const { error: messageError } = await supabase.from('messages').insert([
        {
        sender_id: userID,
        recipient_id: rideData.driver_id,
        body: `Your ride was booked. Ride: ${rideData.from_location} → ${rideData.to_location} on ${rideData.date} at ${rideData.time}`,
        sent_at: new Date().toISOString(),
        },
    ]);

    if (messageError) {
        console.error('Error sending message:', messageError);
        Alert.alert('Booking succeeded, but message failed to send.');
    } else {
        Alert.alert('Ride booked! Waiting for driver approval.');
    }

    fetchDriverRides(); // Refresh available rides
    };


  // Helper: Get booking status of current user for driver's ride
  const getBookingStatus = (ride) => {
    if (!ride.ride_signups) return null;
    const signup = ride.ride_signups.find((r) => r.rider_id === userID);
    return signup ? signup.booked : null;
  };

  // Schedule a ride (rider posts a ride request)
  const scheduleRide = async () => {
    if (!userID) {
      Alert.alert('Error', 'You must be logged in to schedule a ride.');
      return;
    }

    // Check if profile exists, create if needed
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
      posted_by: 'rider',
      driver_id: userID, // For rider posts, driver_id stores the rider's ID
      from_location: from,
      to_location: to,
      date,
      time,
      available_seats: Number(seats),
      phone,
    }]);

    if (error) {
      console.error(error);
      Alert.alert('Error scheduling ride');
    } else {
      Alert.alert('Ride scheduled! Drivers can now book your ride.');
      setFrom(''); setTo(''); setDate(''); setTime(''); setSeats(''); setPhone('');
      fetchMyScheduledRides();
    }
  };

  // Update driver booking status for rider's scheduled ride
  const updateDriverBookingStatus = async (signupId, newStatus) => {
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

    // Send message to the driver who tried to book
    await supabase.from('messages').insert([{
      sender_id: userID,
      recipient_id: rider_id, // This is actually the driver's ID in this context
      body: `Your booking request was ${newStatus}. Ride: ${rideData.from_location} → ${rideData.to_location} on ${rideData.date} at ${rideData.time}`,
      sent_at: new Date().toISOString(),
    }]);

    Alert.alert(`Driver booking ${newStatus}`);
    fetchMyScheduledRides();
  };

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Schedule a Ride</Text>

        <TextInput style={styles.input} placeholder="From" value={from} onChangeText={setFrom} />
        <TextInput style={styles.input} placeholder="To" value={to} onChangeText={setTo} />
        <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Time (HH:MM)" value={time} onChangeText={setTime} />
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

        <Button title="Schedule Ride" onPress={scheduleRide} />

        {/* Show rider's scheduled rides with driver booking requests */}
        <Text style={styles.header}>Your Scheduled Rides</Text>
        <FlatList
          scrollEnabled={false}
          data={myScheduledRides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.rideCard}>
              <Text style={styles.rideTitle}>{item.from_location} → {item.to_location}</Text>
              <Text>{item.date} at {item.time}</Text>
              <Text>Passengers: {item.available_seats}</Text>
              <Text>Phone: {item.phone || 'N/A'}</Text>
              {item.ride_signups?.map((signup) => (
                <View key={signup.id} style={styles.signupCard}>
                  <Text style={styles.driverName}>Driver: {signup.profiles?.full_name || 'N/A'}</Text>
                  <Text>Status: {signup.booked}</Text>
                  {signup.booked === 'pending' && (
                    <View style={styles.buttonRow}>
                      <Button title="Accept" onPress={() => updateDriverBookingStatus(signup.id, 'accepted')} />
                      <Button title="Reject" onPress={() => updateDriverBookingStatus(signup.id, 'rejected')} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        />

        <Text style={styles.header}>Available Rides from Drivers</Text>

        <FlatList
          scrollEnabled={false}
          data={driverRides}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => {
            const status = getBookingStatus(item);
            return (
              <View style={styles.rideCard}>
                <Text style={styles.rideTitle}>{item.from_location} → {item.to_location}</Text>
                <Text>{item.date} at {item.time}</Text>
                <Text>Seats: {item.available_seats}</Text>
                <Text>Phone: {item.phone || 'N/A'}</Text>

                {status ? (
                  <Text>Status: {status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                ) : (
                  <Button title="Book Ride" onPress={() => bookDriverRide(item.id)} />
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
  driverName: { fontSize: 15, fontWeight: '600', color: '#333' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
});
