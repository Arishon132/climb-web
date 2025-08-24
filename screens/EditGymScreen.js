import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function EditGymScreen({ route, navigation }) {
  const { gym, onSave } = route.params; // we'll pass these from GymList
  const [name, setName] = useState(gym.name ?? '');
  const [location, setLocation] = useState(gym.location ?? '');
  const [hours, setHours] = useState(gym.hours ?? {});

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleSave = () => {
    const updated = { ...gym, name, location, hours };
    onSave(updated);          // call back into GymList to update state
    navigation.goBack();      // return to the list
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

      <Text style={styles.label}>Location</Text>
      <TextInput
        value={location}
        onChangeText={setLocation}
        placeholder="Location"
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
    backgroundColor: '#f0f0f0',
    flex: 1
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 8, 
    textAlign: 'center',
    color: '#333'
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginTop: 8,
    color: '#333'
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8,
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    backgroundColor: '#fff'
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayLabel: {
    width: 100,
    fontSize: 14,
    color: '#333',
  },
  hourInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#fff'
  },
  btn: {
    borderRadius: 10, 
    paddingVertical: 12, 
    alignItems: 'center', 
    marginTop: 16
  },
  saveBtn: { backgroundColor: '#22c55e' },
  btnText: { color: '#fff', fontWeight: '700' },
});
