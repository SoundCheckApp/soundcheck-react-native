import { useNavigation, useRoute } from '@react-navigation/native';
import { Heart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const testMusician = {
  id: '00000000-0000-0000-0000-000000000001',
  artist_name: 'SoundCheck Music',
  genre: 'World',
  bio: 'Official SoundCheck test musician for demonstration purposes. Check out our music!',
  image_url: 'https://placehold.co/400x400?text=SC',
  location: 'SoundCheck HQ',
};

const ProfileHeader = ({ fromConsumer }) => {
  const navigation = useNavigation();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [musicianExists, setMusicianExists] = useState(false);

  useEffect(() => {
    const checkMusicianExists = async () => {
      try {
        const { data, error } = await supabase
          .from('musicians')
          .select('id')
          .eq('id', testMusician.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          return;
        }

        setMusicianExists(Boolean(data));
      } catch {
        setMusicianExists(false);
      }
    };

    checkMusicianExists();
  }, []);

  const handleBack = () => {
    if (fromConsumer) {
      navigation.navigate('ConsumerHome');
    } else {
      navigation.goBack();
    }
  };

  const handleFollow = async () => {
    if (!musicianExists) {
      toast.show({
        title: 'Demo Mode',
        description: 'This is a demo musician profile. Following is not available in demo mode.',
      });
      return;
    }

    setIsLoading(true);
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
          .eq('musician_id', testMusician.id);

        if (error) throw error;

        setIsFollowing(false);
        toast.success('Unfollowed', `You unfollowed ${testMusician.artist_name}`);
      } else {
        const { error } = await supabase.from('consumer_follows').insert({
          consumer_id: user.id,
          musician_id: testMusician.id,
        });

        if (error) throw error;

        setIsFollowing(true);
        toast.success('Following', `You are now following ${testMusician.artist_name}`);
      }
    } catch (error) {
      toast.error('Error', 'Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.profileHeader}>
      <Button variant="ghost" size="sm" onPress={handleBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Button>

      <View style={styles.avatarWrapper}>
        <Avatar style={styles.avatar}>
          <AvatarImage source={{ uri: testMusician.image_url }} />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
      </View>
      <Text style={styles.profileName}>{testMusician.artist_name}</Text>
      <Text style={styles.profileMeta}>{testMusician.genre}</Text>
      <Text style={styles.profileLocation}>{testMusician.location}</Text>

      <View style={styles.actionsRow}>
        <Button
          variant="outline"
          size="sm"
          onPress={handleFollow}
          disabled={isLoading}
          style={[styles.followButton, isFollowing && styles.followingButton]}
          textStyle={isFollowing ? styles.followingText : styles.followText}
        >
          <Heart size={16} color={isFollowing ? '#f4f4f5' : '#0f172a'} fill={isFollowing ? '#ef4444' : 'none'} />
          {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
        </Button>
        <TipButton musicianName={testMusician.artist_name} musicianId={testMusician.id} />
      </View>
    </View>
  );
};

const TestMusicianProfile = () => {
  const route = useRoute();
  const { fromConsumer = false } = route.params ?? {};

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <ProfileHeader fromConsumer={fromConsumer} />
            <MusicianBio bio={testMusician.bio} />
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
    color: '#9ca3af',
    fontSize: 13,
  },
  profileLocation: {
    color: '#71717a',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  followButton: {
    backgroundColor: '#ffffff',
  },
  followingButton: {
    backgroundColor: '#ef4444',
  },
  followText: {
    color: '#0f172a',
  },
  followingText: {
    color: '#f4f4f5',
  },
});

export default TestMusicianProfile;

