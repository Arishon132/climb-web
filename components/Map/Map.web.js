import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Map({ lat, lng, name, address, zoom = 14, height = 420, style }) {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  
  if (!isFinite(latNum) || !isFinite(lngNum)) {
    return <Text style={{ color: 'crimson' }}>Invalid coordinates</Text>;
  }

  const openDirections = () =>
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latNum},${lngNum}`, '_blank', 'noopener,noreferrer');

  const openGoogleMaps = () =>
    window.open(`https://www.google.com/maps?q=${latNum},${lngNum}`, '_blank', 'noopener,noreferrer');

  const copyCoords = async () => {
    try { 
      await navigator.clipboard?.writeText(`${latNum}, ${lngNum}`);
      alert('Coordinates copied to clipboard!');
    } catch { 
      alert('Copy failed - try manually: ' + `${latNum}, ${lngNum}`);
    }
  };

  return (
    <View style={[styles.wrap, { height }, style]}>
      {/* Simple Google Maps Embed */}
      <iframe
        src={`https://maps.google.com/maps?q=${latNum},${lngNum}&z=${zoom}&output=embed`}
        style={{ 
          border: 0, 
          height: '100%', 
          width: '100%',
          borderRadius: 12
        }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        title="gym-location"
      />

      {/* Floating Header */}
      {(name || address) && (
        <View style={styles.header}>
          {!!name && <Text style={styles.title}>{name}</Text>}
          {!!address && <Text style={styles.subtitle}>{address}</Text>}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.primary]} onPress={openDirections}>
          <Text style={styles.btnText}>🗺️ Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={openGoogleMaps}>
          <Text style={styles.btnText}>🌍 Open Maps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={copyCoords}>
          <Text style={styles.btnText}>📋 Copy coords</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { 
    borderRadius: 12, 
    overflow: 'hidden', 
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)', 
    backgroundColor: '#e6f2f9', 
    position: 'relative' 
  },
  header: { 
    position: 'absolute', 
    top: 12, 
    left: 12, 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    maxWidth: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { fontWeight: '800', fontSize: 16 },
  subtitle: { fontSize: 12, color: '#555', marginTop: 2 },
  actions: { 
    position: 'absolute', 
    right: 12, 
    bottom: 12, 
    gap: 8, 
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  btn: { 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  primary: { backgroundColor: '#2563eb' },
  secondary: { backgroundColor: '#64748b' },
  btnText: { color: 'white', fontWeight: '700', fontSize: 12 },
});
