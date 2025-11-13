import { useNavigation, useRoute } from '@react-navigation/native';
import { Heart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import AccountNavBar from '@/components/AccountNavBar';
import MusicianBio from '@/components/MusicianBio';
import TipButton from '@/components/TipButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConsumerStatus } from '@/contexts/ConsumerStatusContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProfileHeader = ({
  musician,
  isFollowing,
  isLoadingFollow,
  onFollowToggle,
  fromConsumer,
  onBack,
}) => {
  return (
    <View style={styles.profileHeader}>
      <Button variant="ghost" size="sm" onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Button>

      <View style={styles.avatarWrapper}>
        <Avatar style={styles.avatar}>
          {musician.avatar_url ? (
            <AvatarImage source={{ uri: musician.avatar_url }} />
          ) : (
            <AvatarFallback>
              {(musician.artist_name?.[0] ?? 'A').toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      </View>
      <Text style={styles.profileName}>{musician.artist_name}</Text>
      <Text style={styles.profileMeta}>
        {musician.genre ? musician.genre.charAt(0).toUpperCase() + musician.genre.slice(1) : 'Various'}
      </Text>

      <View style={styles.actionRow}>
        <Button
          variant="outline"
          size="sm"
          onPress={onFollowToggle}
          disabled={isLoadingFollow}
          style={[styles.followButton, isFollowing && styles.followingButton]}
          textStyle={isFollowing ? styles.followingText : styles.followText}
        >
          <Heart
            size={16}
            color={isFollowing ? '#f4f4f5' : '#0f172a'}
            fill={isFollowing ? '#f97316' : 'none'}
          />
          {isLoadingFollow ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
        </Button>
        <TipButton musicianName={musician.artist_name} musicianId={musician.id} />
      </View>
    </View>
  );
};

const CheckInSection = ({ musician }) => {
  const navigation = useNavigation();
  const { checkIn, checkOut, isCheckedIn } = useConsumerStatus();
  const isCurrentlyCheckedIn = isCheckedIn(musician.id);

  const handleCheckIn = () => {
    checkIn(musician.id, musician.artist_name);
    navigation.navigate('EventMode', {
      musicianId: musician.id,
      musician: {
        id: musician.id,
        name: musician.artist_name,
        genre: musician.genre,
        bio: musician.bio,
        image: musician.avatar_url ?? 'https://placehold.co/400x400?text=Artist',
        following: 1243,
      },
    });
    toast.show({
      title: 'Checking In',
      description: `You are checking in to ${musician.artist_name}'s event`,
    });
  };

  const handleCheckOut = () => {
    checkOut();
    toast.success('Checked Out', `You have left ${musician.artist_name}'s event`);
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

const MusicianProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { musicianId, fromConsumer = false } = route.params ?? {};

  const [musician, setMusician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  useEffect(() => {
    const fetchMusician = async () => {
      if (!musicianId) {
        toast.error('Error', 'Musician ID is missing.');
        setLoading(false);
        return;
      }

      try {
        const { data: musicianData, error: musicianError } = await supabase
          .from('musicians')
          .select('*')
          .eq('id', musicianId)
          .single();

        if (musicianError) {
          throw musicianError;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', musicianId)
          .single();

        const complete = {
          id: musicianData.id,
          artist_name: musicianData.artist_name ?? 'Unknown Artist',
          genre: musicianData.genre ?? 'Various',
          bio: musicianData.bio ?? 'No bio available',
          avatar_url: profileData?.avatar_url,
          email: profileData?.email,
        };

        setMusician(complete);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: follow, error } = await supabase
            .from('consumer_follows')
            .select('id')
            .eq('consumer_id', user.id)
            .eq('musician_id', musicianData.id)
            .single();

          if (!error || error.code === 'PGRST116') {
            setIsFollowing(Boolean(follow));
          }
        }
      } catch (err) {
        toast.error('Fetch Error', 'Failed to fetch musician details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMusician();
  }, [musicianId]);

  const handleBack = () => {
    if (fromConsumer) {
      navigation.navigate('ConsumerHome');
    } else {
      navigation.goBack();
    }
  };

  const handleFollowToggle = async () => {
    if (!musician) return;
    setIsLoadingFollow(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Authentication Required', 'Please log in to follow musicians');
        return;
      }

      if (isFollowing) {
        const { error } = await supabase
          .from('consumer_follows')
          .delete()
          .eq('consumer_id', user.id)
          .eq('musician_id', musician.id);
        if (error) throw error;
        setIsFollowing(false);
        toast.success('Unfollowed', `You unfollowed ${musician.artist_name}`);
      } else {
        const { error } = await supabase.from('consumer_follows').insert({
          consumer_id: user.id,
          musician_id: musician.id,
        });
        if (error) throw error;
        setIsFollowing(true);
        toast.success('Following', `You are now following ${musician.artist_name}`);
      }
    } catch (err) {
      toast.error('Error', 'Failed to update follow status');
    } finally {
      setIsLoadingFollow(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#f4f4f5" />
          <Text style={styles.mutedText}>Loading musician details...</Text>
        </View>
        <AccountNavBar />
      </SafeAreaView>
    );
  }

  if (!musician) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loader}>
          <Text style={styles.mutedText}>Musician not found.</Text>
        </View>
        <AccountNavBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <ProfileHeader
              musician={musician}
              isFollowing={isFollowing}
              isLoadingFollow={isLoadingFollow}
              onFollowToggle={handleFollowToggle}
              fromConsumer={fromConsumer}
              onBack={handleBack}
            />
            <MusicianBio bio={musician.bio} />
            <CheckInSection musician={musician} />
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
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mutedText: {
    color: '#a1a1aa',
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
    fontSize: 22,
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
  followingButton: {
    backgroundColor: '#a855f7',
  },
  followText: {
    color: '#0f172a',
  },
  followingText: {
    color: '#f4f4f5',
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
    paddingHorizontal: 36,
  },
  checkoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 36,
  },
  checkActionText: {
    color: '#f4f4f5',
    fontWeight: '700',
  },
});

export default MusicianProfile;

