import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Dimensions, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOutUser } from './services/authService';
import { useAuth } from './contexts/AuthContext';
import { subscribeToGyms, addManualGym, deleteGym as deleteGymDoc, updateGym } from './services/gymService';
import { reverseGeocode } from './src/utils/reverseGeocode';
import { colors } from './src/theme/colors';

const { width } = Dimensions.get('window');

export default function GymList() {
  const navigation = useNavigation();
  const { user, isAuthenticated, isAdmin } = useAuth();
  
  const [gyms, setGyms] = useState([]);
  const [geocodedAddresses, setGeocodedAddresses] = useState({}); // Cache: { "lat,lng": { city, address } }
  
  const [newGymName, setNewGymName] = useState('');
  const [newGymLocation, setNewGymLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hours, setHours] = useState({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  });
  const [showForm, setShowForm] = useState(false);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Subscribe to Firestore gyms collection
  useEffect(() => {
    const unsubscribe = subscribeToGyms((gymList) => {
      setGyms(gymList);
    });

    return () => unsubscribe();
  }, []);

  // Reverse-geocode gyms that don't have address/city but have coordinates
  useEffect(() => {
    const geocodeMissingAddresses = async () => {
      const promises = gyms.map(async (gym) => {
        const hasAddress = gym.city?.trim() || gym.address?.trim();
        const lat = gym.coordinates?.lat;
        const lng = gym.coordinates?.lng;
        const hasValidCoords = typeof lat === 'number' && typeof lng === 'number' && 
                               Number.isFinite(lat) && Number.isFinite(lng);
        
        if (!hasAddress && hasValidCoords) {
          const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
          
          // Skip if already geocoded
          if (geocodedAddresses[cacheKey]) {
            return;
          }

          try {
            const result = await reverseGeocode(lat, lng);
            if (result.city || result.addressLine) {
              setGeocodedAddresses(prev => ({
                ...prev,
                [cacheKey]: result
              }));
            }
          } catch (error) {
            console.warn(`Failed to geocode ${gym.name}:`, error);
          }
        }
      });

      await Promise.all(promises);
    };

    if (gyms.length > 0) {
      geocodeMissingAddresses();
    }
  }, [gyms]);

  // Helper function to get human-friendly location label
  const getLocationLabel = (gym) => {
    let city = gym.city?.trim();
    let address = gym.address?.trim();

    // If no address/city but we have coordinates, try to use geocoded result
    if (!city && !address) {
      const lat = gym.coordinates?.lat;
      const lng = gym.coordinates?.lng;
      if (typeof lat === 'number' && typeof lng === 'number' && 
          Number.isFinite(lat) && Number.isFinite(lng)) {
        const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        const geocoded = geocodedAddresses[cacheKey];
        if (geocoded) {
          city = geocoded.city || null;
          address = geocoded.addressLine || null;
        }
      }
    }

    if (address && city && !address.includes(city)) {
      return `${address}, ${city}`;
    }

    if (address) return address;
    if (city) return city;

    return 'Location not specified';
  };

  // Filter gyms based on search query - using normalized gym shape
  const trimmedQuery = (searchQuery || '').trim().toLowerCase();

  // If search is empty → show ALL gyms (no filtering)
  const displayGyms = !trimmedQuery
    ? gyms
    : gyms.filter((gym) => {
        const fields = [
          gym.name,
          gym.city,
          gym.address,
          gym.osmId,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        return fields.some((text) => text.includes(trimmedQuery));
      });

  // Debug logging
  console.log(
    'GYM DEBUG:',
    'gyms =', gyms.length,
    'displayGyms =', displayGyms.length,
    'search =', trimmedQuery || '(empty)'
  );

  const addGym = async () => {
    if (!isAdmin) {
      Alert.alert(
        "Permission denied",
        "Only admins can modify gyms."
      );
      return;
    }

    if (!newGymName || !newGymLocation) {
      Alert.alert("Error", "Please fill in gym name and location.");
      return;
    }

    try {
      await addManualGym({
        name: newGymName,
        city: newGymLocation,
        address: null,
        rating: 4.7,
        coordinates: {
          lat: null, // Can be added later via edit
          lng: null,
        },
      });
      resetForm();
      Alert.alert("Success", "Gym added successfully!");
    } catch (error) {
      console.error("Error adding gym:", error);
      Alert.alert("Error", "Failed to add gym. Please try again.");
    }
  };

  const resetForm = () => {
    setNewGymName('');
    setNewGymLocation('');
    setHours({
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    });
    setShowForm(false);
  };

  const handleSaveGym = async (updatedGym) => {
    // This is called from EditGymScreen, which already handles the Firestore update
    // We just need to ensure the callback doesn't break anything
    // The snapshot subscription will automatically update the UI
  };

  const deleteGym = (id) => {
    if (!isAdmin) {
      Alert.alert(
        "Permission denied",
        "Only admins can modify gyms."
      );
      return;
    }

    Alert.alert(
      "Delete Gym",
      "Are you sure you want to delete this gym?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              await deleteGymDoc(id);
              // Snapshot will automatically update the UI
            } catch (error) {
              console.error("Error deleting gym:", error);
              Alert.alert("Error", "Failed to delete gym. Please try again.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleEditGym = (gym) => {
    if (!isAdmin) {
      Alert.alert(
        "Permission denied",
        "Only admins can modify gyms."
      );
      return;
    }

    navigation.navigate('EditGym', {
      gym: gym,
      onSave: handleSaveGym,
    });
  };

  const handleSignOut = async () => {
    console.log("handleSignOut pressed");
    try {
      const result = await signOutUser();
      console.log("signOutUser result:", result);

      if (result.success) {
        console.log("Navigating to Welcome after sign-out");
        navigation.replace("Welcome");
      } else {
        Alert.alert("Error", result.error || "Failed to sign out.");
      }
    } catch (error) {
      console.error("Sign-out error in handleSignOut:", error);
      Alert.alert("Error", "Something went wrong during sign-out.");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    return stars.join('');
  };

  return (
    <View style={styles.screen}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        bounces={false}
        scrollEnabled={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              {!isAuthenticated && (
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => navigation.navigate('Welcome')}
                >
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
              )}
              <View>
                <Text style={styles.title}>Climbing Gyms</Text>
                <Text style={styles.subtitle}>{gyms.length} gyms available</Text>
              </View>
            </View>
            {isAuthenticated && (
              <TouchableOpacity 
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Text style={styles.signOutButtonText}>🚪 Sign Out</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Authentication Status Indicator */}
        {user && (
          <View style={styles.authBanner}>
            <Text style={styles.authBannerText}>
              Logged in as: {user.email}
            </Text>
            <Text style={styles.authBannerSubtext}>
              UID: {user.uid}
            </Text>
          </View>
        )}

        {!user && (
          <View style={styles.authBannerWarning}>
            <Text style={styles.authBannerWarningText}>
              Not signed in
            </Text>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Search gyms..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        {/* Add Gym Button */}
        {isAdmin ? (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={styles.addButtonText}>
              {showForm ? '✕ Cancel' : '➕ Add Gym'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.addButton, { opacity: 0.5 }]}>
            <Text style={styles.addButtonText}>
              {isAuthenticated ? "Only admins can add gyms" : "Sign in to add gyms"}
            </Text>
          </View>
        )}

        {/* Add Gym Form */}
        {showForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Add New Gym</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Gym Name"
              value={newGymName}
              onChangeText={setNewGymName}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={newGymLocation}
              onChangeText={setNewGymLocation}
            />
            
            <Text style={styles.sectionTitle}>Activity Hours:</Text>
            {daysOfWeek.map((day) => (
              <View key={day} style={styles.hourRow}>
                <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}:</Text>
                <TextInput
                  style={styles.hourInput}
                  placeholder="e.g., 9:00 AM - 10:00 PM"
                  value={hours[day]}
                  onChangeText={(text) => setHours(prev => ({ ...prev, [day]: text }))}
                />
              </View>
            ))}

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={addGym}
              disabled={!isAdmin}
            >
              <Text style={styles.submitButtonText}>Add Gym</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Debug info */}
        <Text style={styles.debugText}>
          Total gyms: {gyms.length} • Visible: {displayGyms.length}
        </Text>
        
        {/* Gym List */}
        {displayGyms.map((gym) => (
          <View key={gym.id} style={styles.gymCard}>
            <View style={styles.gymHeaderRow}>
              <Text style={styles.gymName}>{gym.name}</Text>
              {gym.source && (
                <Text style={styles.gymSourcePill}>
                  {gym.source === 'osm' ? 'OSM' : 'Manual'}
                </Text>
              )}
            </View>
            
            <Text style={styles.gymLocation}>
              📍 {getLocationLabel(gym)}
            </Text>

            {gym.openingHoursLines && gym.openingHoursLines.length > 0 && (
              <Text style={styles.hoursHint}>
                🕐 {gym.openingHoursLines[0].length > 40 
                  ? `${gym.openingHoursLines[0].substring(0, 40)}…` 
                  : gym.openingHoursLines[0]}
              </Text>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => navigation.navigate('GymDetails', { gym })}
              >
                <Text style={styles.detailsButtonText}>Details</Text>
              </TouchableOpacity>
              
              {isAdmin && (
                <>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditGym(gym)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteGym(gym.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ))}
        
        {displayGyms.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>🔍 No gyms found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
      WebkitOverflowScrolling: 'touch',
    }),
  },
  scrollContent: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 24,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  signOutButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
  authBanner: {
    padding: 10,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 8,
    margin: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  authBannerText: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.text,
  },
  authBannerSubtext: {
    fontSize: 12,
    color: colors.textMuted,
  },
  authBannerWarning: {
    padding: 10,
    backgroundColor: '#fee',
    borderRadius: 8,
    margin: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  authBannerWarningText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#c00',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    margin: 16,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    margin: 16,
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
    marginTop: 8,
    marginBottom: 12,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  hourInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: colors.background,
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  gymCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  gymHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    flex: 1,
  },
  gymSourcePill: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  gymLocation: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  hoursHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  detailsButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  editButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#dc2626',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  debugText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
    textAlign: 'center',
  },
});