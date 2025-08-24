import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function GymList() {
  const navigation = useNavigation();
  const [gyms, setGyms] = useState([
    { 
      id: 1, 
      name: 'Boulder Zone', 
      location: 'Tel Aviv',
      latitude: 32.0853,
      longitude: 34.7818,
      rating: 4.8,
      distance: '2.3 km',
      hours: {
        monday: '9:00 AM - 10:00 PM',
        tuesday: '9:00 AM - 10:00 PM',
        wednesday: '9:00 AM - 10:00 PM',
        thursday: '9:00 AM - 10:00 PM',
        friday: '9:00 AM - 3:00 PM',
        saturday: 'Closed',
        sunday: '9:00 AM - 10:00 PM'
      }
    },
    { 
      id: 2, 
      name: 'Climb TLV', 
      location: 'Jerusalem',
      latitude: 31.7683,
      longitude: 35.2137,
      rating: 4.6,
      distance: '5.1 km',
      hours: {
        monday: '8:00 AM - 11:00 PM',
        tuesday: '8:00 AM - 11:00 PM',
        wednesday: '8:00 AM - 11:00 PM',
        thursday: '8:00 AM - 11:00 PM',
        friday: '8:00 AM - 2:00 PM',
        saturday: 'Closed',
        sunday: '8:00 AM - 11:00 PM'
      }
    },
  ]);
  
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

  // Filter gyms based on search query
  const filteredGyms = gyms.filter(gym => 
    gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gym.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addGym = () => {
    if (newGymName && newGymLocation) {
      setGyms([
        ...gyms,
        {
          id: Date.now(),
          name: newGymName,
          location: newGymLocation,
          rating: 0,
          distance: 'New',
          hours: { ...hours }
        },
      ]);
      resetForm();
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

  const handleSaveGym = (updatedGym) => {
    setGyms(prev =>
      prev.map(g => (g.id === updatedGym.id ? updatedGym : g))
    );
  };

  const deleteGym = (id) => {
    Alert.alert(
      "Delete Gym",
      "Are you sure you want to delete this gym?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => setGyms(gyms.filter(gym => gym.id !== id)),
          style: "destructive"
        }
      ]
    );
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Climbing Gyms</Text>
        <Text style={styles.subtitle}>{gyms.length} gyms available</Text>
      </View>

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
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setShowForm(!showForm)}
      >
        <Text style={styles.addButtonText}>
          {showForm ? '✕ Cancel' : '➕ Add Gym'}
        </Text>
      </TouchableOpacity>

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
          >
            <Text style={styles.submitButtonText}>Add Gym</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Gym List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredGyms.map((gym) => (
          <View key={gym.id} style={styles.gymCard}>
            <View style={styles.gymInfo}>
              <View style={styles.gymHeader}>
                <Text style={styles.gymName}>{gym.name}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>{renderStars(gym.rating)}</Text>
                  <Text style={styles.ratingNumber}>{gym.rating}</Text>
                </View>
              </View>
              
              <View style={styles.gymDetails}>
                <Text style={styles.gymLocation}>📍 {gym.location}</Text>
                <Text style={styles.gymDistance}>📏 {gym.distance}</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.detailsButton]}
                onPress={() => navigation.navigate('GymDetails', { gym })}
              >
                <Text style={styles.actionButtonText}>👁️ Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() =>
                  navigation.navigate('EditGym', {
                    gym: gym,
                    onSave: handleSaveGym,
                  })
                }
              >
                <Text style={styles.actionButtonText}>✏️ Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteGym(gym.id)}
              >
                <Text style={styles.actionButtonText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {filteredGyms.length === 0 && (
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
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addButton: {
    margin: 16,
    backgroundColor: '#2563eb',
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
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    margin: 16,
    backgroundColor: '#fff',
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
    color: '#1e293b',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
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
    color: '#374151',
  },
  hourInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  submitButton: {
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  gymCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  gymInfo: {
    marginBottom: 16,
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gymName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginBottom: 2,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  gymDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  gymLocation: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  gymDistance: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButton: {
    backgroundColor: '#2563eb',
  },
  editButton: {
    backgroundColor: '#f59e0b',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});