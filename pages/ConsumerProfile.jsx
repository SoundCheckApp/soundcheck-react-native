import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import AccountNavBar from '@/components/AccountNavBar';
import MusicianBio from '@/components/MusicianBio';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProfileHeader = ({ consumerData, profileData, onBack }) => {
  if (!consumerData) {
    return (
      <View style={styles.headerLoading}>
        <Button variant="ghost" size="sm" onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={16} color="#f4f4f5" />
          <Text style={styles.backButtonText}>Back</Text>
        </Button>
        <Text style={styles.mutedText}>Loading profile...</Text>
      </View>
    );
  }

  const initials = `${consumerData.first_name?.[0] ?? ''}${consumerData.last_name?.[0] ?? ''}`;

  return (
    <View style={styles.profileHeader}>
      <Button variant="ghost" size="sm" onPress={onBack} style={styles.backButton}>
        <ArrowLeft size={16} color="#f4f4f5" />
        <Text style={styles.backButtonText}>Back</Text>
      </Button>

      <View style={styles.avatarWrapper}>
        <Avatar style={styles.avatar}>
          {profileData?.avatar_url ? (
            <AvatarImage source={{ uri: profileData.avatar_url }} />
          ) : null}
          <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
        </Avatar>
      </View>

      <Text style={styles.profileName}>
        {consumerData.username ||
          [consumerData.first_name, consumerData.last_name].filter(Boolean).join(' ') ||
          'Music Fan'}
      </Text>
      <Text style={styles.profileSubheading}>
        Music Fan • {consumerData.preferred_genre || 'All Genres'}
      </Text>
    </View>
  );
};

const ConsumerStats = ({ consumerId }) => {
  const currentYear = new Date().getFullYear();
  const [stats, setStats] = useState({ checkins: null, avgRating: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data: checkins } = await supabase
          .from('consumer_checkins')
          .select('id')
          .eq('consumer_id', consumerId)
          .gte('event_date', `${currentYear}-01-01`)
          .lte('event_date', `${currentYear}-12-31`);

        const { data: reviews } = await supabase
          .from('consumer_reviews')
          .select('rating, created_at')
          .eq('consumer_id', consumerId)
          .gte('created_at', `${currentYear}-01-01T00:00:00Z`)
          .lt('created_at', `${currentYear + 1}-01-01T00:00:00Z`);

        const checkinsCount = checkins?.length ?? 0;
        let avgRating = null;
        if (reviews && reviews.length > 0) {
          const total = reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0);
          avgRating = total / reviews.length;
        }

        setStats({
          checkins: checkinsCount > 0 ? checkinsCount : null,
          avgRating: avgRating,
        });
      } catch (err) {
        toast.error('Error', 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [consumerId, currentYear]);

  if (loading) {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValuePlaceholder}>...</Text>
          <Text style={styles.statLabel}>{currentYear} Check-Ins</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValuePlaceholder}>...</Text>
          <Text style={styles.statLabel}>{currentYear} Avg Rating</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>
          {stats.checkins !== null ? stats.checkins : '--'}
        </Text>
        <Text style={styles.statLabel}>{currentYear} Check-Ins</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>
          {stats.avgRating !== null ? stats.avgRating.toFixed(1) : '--'}
        </Text>
        <Text style={styles.statLabel}>{currentYear} Avg Rating</Text>
      </View>
    </View>
  );
};

const ConsumerProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { consumerId } = route.params ?? {};

  const [isLoading, setIsLoading] = useState(true);
  const [consumerData, setConsumerData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadConsumer = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error('Error', 'You must be logged in to view this profile');
          setIsLoading(false);
          return;
        }

        setCurrentUser(session.user);

        const targetId = consumerId === 'current' || !consumerId ? session.user.id : consumerId;

        const { data: consumer, error: consumerError } = await supabase
          .from('consumers')
          .select('*')
          .eq('id', targetId)
          .single();

        if (consumerError) {
          toast.error('Error', 'Could not fetch consumer profile');
          setIsLoading(false);
          return;
        }

        setConsumerData(consumer);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single();

        if (profile) {
          setProfileData(profile);
        }
      } catch (err) {
        toast.error('Error', 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadConsumer();
  }, [consumerId]);

  const targetId = useMemo(() => {
    if (consumerId === 'current' || !consumerId) {
      return currentUser?.id;
    }
    return consumerId;
  }, [consumerId, currentUser]);

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#f4f4f5" />
          <Text style={styles.mutedText}>Loading consumer profile...</Text>
        </View>
        <AccountNavBar />
      </SafeAreaView>
    );
  }

  if (!consumerData) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loader}>
          <Text style={styles.mutedText}>Consumer profile not found</Text>
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
              consumerData={consumerData}
              profileData={profileData}
              onBack={handleBack}
            />
            <MusicianBio bio={consumerData.bio || 'No bio available'} />
            {targetId ? <ConsumerStats consumerId={targetId} /> : null}
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
  card: {
    backgroundColor: '#18181b',
    borderColor: 'rgba(63,63,70,0.5)',
  },
  cardContent: {
    gap: 16,
  },
  headerLoading: {
    alignItems: 'center',
    gap: 12,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    marginTop: 12,
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
  profileSubheading: {
    color: '#9ca3af',
    fontSize: 13,
  },
  statsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.4)',
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#f4f4f5',
    fontSize: 22,
    fontWeight: '700',
  },
  statValuePlaceholder: {
    color: '#a1a1aa',
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  mutedText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ConsumerProfile;

