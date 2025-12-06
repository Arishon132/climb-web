import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { updateGym } from '../services/gymService';
import { colors } from '../src/theme/colors';

export default function EditGymScreen({ route, navigation }) {
  const { gym, onSave } = route.params; // we'll pass these from GymList
  const [name, setName] = useState(gym.name ?? '');
  const [city, setCity] = useState(gym.city ?? '');
  const [address, setAddress] = useState(gym.address ?? '');
  const [lat, setLat] = useState(gym.coordinates?.lat?.toString() ?? '');
  const [lng, setLng] = useState(gym.coordinates?.lng?.toString() ?? '');
  const [hours, setHours] = useState(gym.raw?.hours || gym.hours || {});

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleSave = async () => {
    // Parse coordinates
    const parsedLat = lat.trim() ? parseFloat(lat) : null;
    const parsedLng = lng.trim() ? parseFloat(lng) : null;

    const coordinates = {
      lat: parsedLat != null && Number.isFinite(parsedLat) ? parsedLat : null,
      lng: parsedLng != null && Number.isFinite(parsedLng) ? parsedLng : null,
    };

    try {
      // Update in Firestore
      await updateGym(gym.id, {
        name,
        city: city || null,
        address: address || null,
        coordinates,
        hours,
      });

      // Call the callback for any local state updates
      if (onSave) {
        onSave({ ...gym, name, city, address, coordinates, hours });
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error updating gym:', error);
      Alert.alert('Error', 'Failed to update gym. Please try again.');
    }
  };

  const updateHours = (day, value) => {
    setHours(prev => ({ ...prev, [day]: value }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Gym</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Gym name"
        style={styles.input}
      />

      <Text style={styles.label}>City</Text>
      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="City"
        style={styles.input}
      />

      <Text style={styles.label}>Address (optional)</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Street address"
        style={styles.input}
      />

      <Text style={styles.label}>Latitude (optional)</Text>
      <TextInput
        value={lat}
        onChangeText={setLat}
        placeholder="e.g., 31.7683"
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Longitude (optional)</Text>
      <TextInput
        value={lng}
        onChangeText={setLng}
        placeholder="e.g., 35.2137"
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Activity Hours:</Text>
      {daysOfWeek.map((day) => (
        <View key={day} style={styles.hourRow}>
          <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}:</Text>
          <TextInput
            style={styles.hourInput}
            placeholder="e.g., 9:00 AM - 10:00 PM"
            value={hours[day] || ''}
            onChangeText={(text) => updateHours(day, text)}
          />
        </View>
      ))}

      <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSave}>
        <Text style={styles.btnText}>Save changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16, 
    gap: 10,
    backgroundColor: colors.background,
    flex: 1
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 8, 
    textAlign: 'center',
    color: colors.secondary
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginTop: 8,
    color: colors.text
  },
  input: {
    borderWidth: 1, 
    borderColor: colors.border, 
    borderRadius: 8,
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    backgroundColor: colors.card,
    color: colors.text
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayLabel: {
    width: 100,
    fontSize: 14,
    color: colors.text,
  },
  hourInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    borderRadius: 5,
    backgroundColor: colors.card,
    color: colors.text
  },
  btn: {
    borderRadius: 8, 
    paddingVertical: 12, 
    alignItems: 'center', 
    marginTop: 16
  },
  saveBtn: { backgroundColor: colors.primary },
  btnText: { color: '#fff', fontWeight: '700' },
});
