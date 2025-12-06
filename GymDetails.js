// GymDetails.js (SAFE VERSION WITH MAP)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import Map from './components/Map';
import { reverseGeocode } from './src/utils/reverseGeocode';
import { colors } from './src/theme/colors';

export default function GymDetails({ route }) {
  const gym = route.params?.gym ?? {};
  const [geocodedAddress, setGeocodedAddress] = useState(null);
  
  // Use normalized gym shape
  const name = gym.name || 'Gym Name';
  let city = gym.city || null;
  let address = gym.address || null;
  const openingHoursLines = gym.openingHoursLines || [];
  
  // Get coordinates from normalized shape
  const lat = gym.coordinates?.lat;
  const lng = gym.coordinates?.lng;

  // Reverse-geocode if we don't have address/city but have coordinates
  useEffect(() => {
    const fetchAddress = async () => {
      if (!city && !address && lat && lng && 
          typeof lat === 'number' && typeof lng === 'number' && 
          Number.isFinite(lat) && Number.isFinite(lng)) {
        try {
          const result = await reverseGeocode(lat, lng);
          if (result.city || result.addressLine) {
            setGeocodedAddress(result);
          }
        } catch (error) {
          console.warn('Failed to geocode address:', error);
        }
      }
    };

    fetchAddress();
  }, [city, address, lat, lng]);

  // Use geocoded address if available
  if (geocodedAddress) {
    if (!city) city = geocodedAddress.city;
    if (!address) address = geocodedAddress.addressLine;
  }
  
  // Build location label with priority: address + city > address > city > "Location not specified"
  let locationLabel = 'Location not specified';
  if (address && city && !address.includes(city)) {
    locationLabel = `${address}, ${city}`;
  } else if (address) {
    locationLabel = address;
  } else if (city) {
    locationLabel = city;
  }
  
  // Validate coordinates
  const hasValidCoords =
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.location}>{city}</Text>
            {address && <Text style={styles.address}>{address}</Text>}
          </View>

          {/* Map Section */}
          {hasValidCoords ? (
            <View style={styles.mapContainer}>
              <Map 
                lat={lat} 
                lng={lng} 
                name={name} 
                address={address || city} 
                height={420} 
              />
            </View>
          ) : (
            <View style={styles.noMapContainer}>
              <Text style={styles.noMapText}>📍 Location not specified</Text>
              <Text style={styles.noMapSubtext}>No coordinates available for this gym</Text>
            </View>
          )}

          {/* Opening Hours Section */}
          <View style={styles.hoursContainer}>
            <Text style={styles.sectionTitle}>Opening hours</Text>
            {openingHoursLines.length > 0 ? (
              openingHoursLines.map((line, index) => (
                <Text key={index} style={styles.hoursLine}>{line}</Text>
              ))
            ) : (
              <Text style={styles.noHoursText}>Opening hours not provided in OSM</Text>
            )}
          </View>

          {/* Quick Info Section */}
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>📍 Location</Text>
              <Text style={styles.infoText}>{locationLabel}</Text>
            </View>
            
            {hasValidCoords && (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>🗺️ Coordinates</Text>
                <Text style={styles.infoText}>
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflow: 'hidden',
    }),
  },
  scrollView: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
    }),
  },
  scrollContent: {
    paddingBottom: 32,
  },
  content: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 24,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: 4,
  },
  location: {
    fontSize: 18,
    color: colors.textMuted,
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
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 12,
  },
  hoursLine: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: 4,
  },
  noHoursText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'normal',
  },
  infoContainer: {
    margin: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  address: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  noMapContainer: {
    margin: 16,
    padding: 40,
    backgroundColor: colors.background,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  noMapText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  noMapSubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
}); 