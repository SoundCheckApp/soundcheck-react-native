import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import AccountNavBar from '@/components/AccountNavBar';
import RadiusButton from '@/components/RadiusButton';
import UserMap from '@/components/UserMap';
import { useConsumerStatus } from '@/contexts/ConsumerStatusContext';
import { toast } from '@/hooks/use-toast';

const TEST_MUSICIAN = {
  id: 'test-musician-id',
  name: 'SoundCheck Music',
  genre: 'World',
  location: {
    lat: 38.627,
    lng: -90.1994,
  },
  isTestMusician: true,
};

const DEFAULT_LOCATION = {
  lat: 38.627,
  lng: -90.1994,
};

const ConsumerHomepage = () => {
  const navigation = useNavigation();
  const { checkedInMusician, isCheckedIn, checkOut } = useConsumerStatus();

  const [radius, setRadius] = useState(5);
  const [userLocation, setUserLocation] = useState(null);
  const [musicians, setMusicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMusician, setSelectedMusician] = useState(null);

  useEffect(() => {
    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Location Error', 'Location permission denied. Showing default area.');
          setUserLocation(DEFAULT_LOCATION);
          setIsLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      } catch (err) {
        toast.error('Location Error', 'Unable to access your location. Showing default area.');
        setUserLocation(DEFAULT_LOCATION);
      } finally {
        setIsLoading(false);
      }
    };

    requestLocation();
  }, []);

  useEffect(() => {
    if (!userLocation) {
      setMusicians([TEST_MUSICIAN]);
      return;
    }

    const mockMusicians = [
      {
        id: 'jazz-player-id',
        name: 'Jazz Player',
        genre: 'Jazz',
        location: {
          lat: userLocation.lat + 0.01,
          lng: userLocation.lng + 0.01,
        },
      },
    ];

    setMusicians([...mockMusicians, TEST_MUSICIAN]);
  }, [userLocation, radius]);

  const handleMusicianSelect = (musician) => {
    setSelectedMusician(musician);
  };

  const handleMusicianPress = (musician) => {
    const currentlyCheckedIn = isCheckedIn(musician.id);

    if (currentlyCheckedIn) {
      navigation.navigate('EventDetail', { eventId: musician.id });
    } else if (musician.isTestMusician) {
      navigation.navigate('MusicianProfile', { id: 'test-musician-id' });
    } else {
      navigation.navigate('MusicianProfile', { id: musician.id });
    }
  };

  const handleCheckOut = () => {
    if (checkedInMusician) {
      checkOut();
    }
  };

  const musiciansList = useMemo(() => musicians, [musicians]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Nearby Musicians</Text>
            {checkedInMusician ? (
              <TouchableOpacity onPress={handleCheckOut}>
                <Text style={styles.link}>Checked in to {checkedInMusician.name}. Tap to tune out.</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <RadiusButton radius={radius} setRadius={setRadius} />
        </View>

        <View style={styles.mapContainer}>
          {isLoading ? (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="small" color="#f4f4f5" />
              <Text style={styles.mutedText}>Loading map...</Text>
            </View>
          ) : (
            <UserMap
              radius={radius}
              userLocation={userLocation}
              musicians={musiciansList}
              onSelectMusician={handleMusicianSelect}
              selectedMusician={selectedMusician}
            />
          )}
        </View>

        <View style={styles.listContainer}>
          {musiciansList.length > 0 ? (
            musiciansList.map((musician) => {
              const currentlyCheckedIn = isCheckedIn(musician.id);
              const isSelected = selectedMusician?.id === musician.id;

              return (
                <TouchableOpacity
                  key={musician.id}
                  style={[styles.musicianRow, isSelected && styles.musicianRowSelected]}
                  onPress={() => handleMusicianPress(musician)}
                >
                  <View>
                    <Text style={styles.musicianName}>{musician.name}</Text>
                    <Text style={styles.musicianMeta}>
                      Genre: {musician.genre.charAt(0).toUpperCase() + musician.genre.slice(1)}
                    </Text>
                    {musician.isTestMusician ? (
                      <Text style={styles.badge}>Official SoundCheck Account</Text>
                    ) : null}
                  </View>
                  <View style={[styles.statusPill, currentlyCheckedIn ? styles.pillCheckedIn : styles.pillView]}>
                    <Text style={styles.pillText}>{currentlyCheckedIn ? 'TUNED IN' : 'VIEW'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.mutedText}>No musicians currently live in your area.</Text>
          )}
        </View>
      </ScrollView>

      <AccountNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b0b12',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#f4f4f5',
    fontSize: 20,
    fontWeight: '700',
  },
  link: {
    color: '#38bdf8',
    fontSize: 12,
    marginTop: 4,
  },
  mapContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.5)',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(39,39,42,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  listContainer: {
    gap: 12,
  },
  musicianRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(39,39,42,0.8)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.4)',
  },
  musicianRowSelected: {
    backgroundColor: 'rgba(99,102,241,0.18)',
    borderColor: 'rgba(99,102,241,0.5)',
  },
  musicianName: {
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '600',
  },
  musicianMeta: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 4,
  },
  badge: {
    marginTop: 6,
    color: '#c4b5fd',
    fontSize: 12,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillCheckedIn: {
    backgroundColor: '#22c55e',
  },
  pillView: {
    backgroundColor: '#a855f7',
  },
  pillText: {
    color: '#0f0f17',
    fontSize: 12,
    fontWeight: '700',
  },
  mutedText: {
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default ConsumerHomepage;

