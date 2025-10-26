import { MapPin } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

// Get screen dimensions for map sizing
const { width, height } = Dimensions.get('window');

// Define the types for better JSDoc support
/**
 * @typedef {Object} Musician
 * @property {string} id - Musician ID
 * @property {string} name - Musician name
 * @property {string} genre - Music genre
 * @property {Object} location - Location coordinates
 * @property {number} location.lat - Latitude
 * @property {number} location.lng - Longitude
 * @property {boolean} [isTestMusician] - Whether this is a test musician
 */

/**
 * @typedef {Object} UserMapProps
 * @property {number} [radius] - Search radius in miles
 * @property {Object|null} [userLocation] - User's current location
 * @property {Musician[]} [musicians] - Array of musicians to display
 * @property {Function} [onSelectMusician] - Callback when musician is selected
 * @property {Musician|null} [selectedMusician] - Currently selected musician
 */

// Placeholder map component that integrates with React Native Maps
const UserMap = ({ 
  radius = 5, 
  userLocation = null, 
  musicians = [], 
  onSelectMusician = () => {}, 
  selectedMusician = null 
}) => {
  const mapRef = useRef(null);
  
  // Convert radius from miles to meters for map display
  const radiusInMeters = radius * 1609.34; // 1 mile = 1609.34 meters
  
  // Default location (San Francisco) if no user location provided
  const defaultLocation = {
    latitude: 37.7749,
    longitude: -122.4194,
  };
  
  const mapLocation = userLocation || defaultLocation;
  
  // This would be replaced with actual map initialization code
  useEffect(() => {
    console.log("Map initialized with radius:", radius);
    console.log("User location:", userLocation);
    console.log("Musicians in area:", musicians);
    console.log("Selected musician:", selectedMusician);
    
    // Future enhancement: Add real map integration here
  }, [radius, userLocation, musicians, selectedMusician]);

  const handleMarkerPress = (musician) => {
    onSelectMusician(musician);
  };

  // If no user location, show placeholder
  if (!userLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <MapPin size={40} color="#71717a" />
          <Text style={styles.placeholderText}>
            Map showing musicians within {radius} miles
          </Text>
          <Text style={styles.subText}>
            Enable location to see musicians near you
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: mapLocation.lat,
          longitude: mapLocation.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {/* User location circle */}
        <Circle
          center={{
            latitude: mapLocation.lat,
            longitude: mapLocation.lng,
          }}
          radius={radiusInMeters}
          strokeColor="#3b82f6" // blue-500
          fillColor="rgba(59, 130, 246, 0.1)" // blue-500 with opacity
          strokeWidth={2}
        />
        
        {/* Musician markers */}
        {musicians.map((musician) => (
          <Marker
            key={musician.id}
            coordinate={{
              latitude: musician.location.lat,
              longitude: musician.location.lng,
            }}
            onPress={() => handleMarkerPress(musician)}
            pinColor={selectedMusician?.id === musician.id ? '#3b82f6' : '#8b5cf6'} // blue-500 or purple-500
          >
            <View style={[
              styles.markerContainer,
              selectedMusician?.id === musician.id && styles.selectedMarker
            ]}>
              <View style={[
                styles.marker,
                { backgroundColor: selectedMusician?.id === musician.id ? '#3b82f6' : '#8b5cf6' }
              ]} />
            </View>
          </Marker>
        ))}
      </MapView>
      
      {/* Map overlay with radius info */}
      <View style={styles.overlay}>
        <View style={styles.radiusInfo}>
          <Text style={styles.radiusText}>
            Showing musicians within {radius} miles
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 150, // rounded-full equivalent
    overflow: 'hidden',
    backgroundColor: '#f4f4f5', // zinc-100
    borderWidth: 4,
    borderColor: '#27272a', // zinc-800
  },
  map: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e4e4e7', // zinc-200
  },
  placeholderText: {
    fontSize: 14,
    color: '#71717a', // zinc-500
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  subText: {
    fontSize: 12,
    color: '#71717a', // zinc-500
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  selectedMarker: {
    transform: [{ scale: 1.2 }],
  },
  overlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  radiusInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  radiusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default UserMap;
