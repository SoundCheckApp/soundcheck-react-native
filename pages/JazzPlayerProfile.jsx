import { useNavigation, useRoute } from '@react-navigation/native';
import { Heart } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import AccountNavBar from '@/components/AccountNavBar';
import MusicianBio from '@/components/MusicianBio';
import TipButton from '@/components/TipButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConsumerStatus } from '@/contexts/ConsumerStatusContext';

const jazzPlayer = {
  id: 'jazz-player-id',
  artist_name: 'Jazz Player',
  genre: 'Jazz',
  bio: 'A talented jazz musician with years of experience performing in intimate venues and large concert halls. Specializes in smooth jazz, bebop, and fusion styles.',
  image_url: 'https://placehold.co/400x400?text=Jazz',
  location: 'Downtown District',
};

const ProfileHeader = ({ onBack }) => {
  const initials = useMemo(() => 'JP', []);

  return (
    <View style={styles.profileHeader}>
      <Button variant="ghost" size="sm" onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Button>

      <View style={styles.avatarWrapper}>
        <Avatar style={styles.avatar}>
          <AvatarImage source={{ uri: jazzPlayer.image_url }} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </View>

      <Text style={styles.profileName}>{jazzPlayer.artist_name}</Text>
      <Text style={styles.profileMeta}>{jazzPlayer.genre}</Text>
      <Text style={styles.profileLocation}>{jazzPlayer.location}</Text>

      <View style={styles.actionRow}>
        <Button variant="outline" size="sm" style={styles.followButton}>
          <Heart size={16} color="#0f172a" />
          Follow
        </Button>
        <TipButton musicianName={jazzPlayer.artist_name} musicianId={jazzPlayer.id} />
      </View>
    </View>
  );
};

const CheckInSection = () => {
  const navigation = useNavigation();
  const { checkIn, checkOut, isCheckedIn } = useConsumerStatus();
  const isCurrentlyCheckedIn = isCheckedIn(jazzPlayer.id);

  const handleCheckIn = () => {
    checkIn(jazzPlayer.id, jazzPlayer.artist_name);
    navigation.navigate('EventMode', {
      musicianId: jazzPlayer.id,
      musician: {
        id: jazzPlayer.id,
        name: jazzPlayer.artist_name,
        genre: jazzPlayer.genre,
        bio: jazzPlayer.bio,
        image: jazzPlayer.image_url,
        following: 856,
      },
    });
  };

  const handleCheckOut = () => {
    checkOut();
  };

  return (
    <View style={styles.checkInContainer}>
      <Button
        onPress={isCurrentlyCheckedIn ? handleCheckOut : handleCheckIn}
        style={isCurrentlyCheckedIn ? styles.checkoutButton : styles.checkinButton}
        textStyle={styles.checkActionText}
      >
        {isCurrentlyCheckedIn ? 'CHECK OUT' : 'CHECK-IN'}
      </Button>
    </View>
  );
};

const JazzPlayerProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const fromConsumer = route.params?.fromConsumer ?? false;

  const handleBack = () => {
    if (fromConsumer) {
      navigation.navigate('ConsumerHome');
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <ProfileHeader onBack={handleBack} />
            <MusicianBio bio={jazzPlayer.bio} />
            <CheckInSection />
          </CardContent>
        </Card>
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
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#18181b',
    borderColor: 'rgba(63,63,70,0.5)',
  },
  cardContent: {
    gap: 16,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#f4f4f5',
    fontSize: 14,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: '#27272a',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    color: '#f4f4f5',
    fontSize: 20,
    fontWeight: '700',
  },
  profileMeta: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  profileLocation: {
    color: '#71717a',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  followButton: {
    backgroundColor: '#ffffff',
  },
  checkInContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.4)',
    alignItems: 'center',
  },
  checkinButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 32,
  },
  checkoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 32,
  },
  checkActionText: {
    color: '#f4f4f5',
    fontWeight: '700',
  },
});

export default JazzPlayerProfile;

