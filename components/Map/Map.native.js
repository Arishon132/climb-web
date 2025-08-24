import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

export default function Map({ lat, lng, name, address, zoom = 0.04, height = 420, style }) {
  const openDirections = () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
  
  return (
    <View style={[styles.wrap, { height }, style]}>
      <MapView
        style={{ height: '100%', width: '100%' }}
        initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: zoom, longitudeDelta: zoom }}
        showsCompass
        showsUserLocation
      >
        <Marker coordinate={{ latitude: lat, longitude: lng }}>
          <Callout>
            <Text style={{ fontWeight: '800' }}>{name}</Text>
            <Text>{address}</Text>
          </Callout>
        </Marker>
      </MapView>
      
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.primary]} onPress={openDirections}>
          <Text style={styles.btnText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 12, overflow: 'hidden', elevation: 3, backgroundColor: '#e6f2f9' },
  actions: { position: 'absolute', right: 12, bottom: 12 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  primary: { backgroundColor: '#2563eb' },
  btnText: { color: 'white', fontWeight: '700' },
});
