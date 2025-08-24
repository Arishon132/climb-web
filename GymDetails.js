// GymDetails.js (SAFE VERSION WITH MAP)
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Map from './components/Map';

export default function GymDetails({ route }) {
  const gym = route.params?.gym ?? {};
  const { name, location, latitude, longitude, hours } = gym;

  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>{name || 'Gym Name'}</Text>
        <Text style={styles.location}>{location || 'Location'}</Text>
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        <Map 
          lat={lat} 
          lng={lng} 
          name={name} 
          address={location} 
          height={420} 
        />
      </View>

      {/* Hours Section */}
      {hours && (
        <View style={styles.hoursContainer}>
          <Text style={styles.sectionTitle}>Opening Hours</Text>
          {Object.entries(hours).map(([day, time]) => (
            <View key={day} style={styles.hourRow}>
              <Text style={styles.dayText}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Text>
              <Text style={styles.timeText}>
                {time || 'Closed'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick Info Section */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📍 Location</Text>
          <Text style={styles.infoText}>{location}</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🗺️ Coordinates</Text>
          <Text style={styles.infoText}>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  location: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
  },
  mapContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  hoursContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  timeText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  infoContainer: {
    margin: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
}); 