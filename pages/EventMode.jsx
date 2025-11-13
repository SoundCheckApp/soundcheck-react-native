import { useNavigation, useRoute } from '@react-navigation/native';
import { Heart, Star } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import AccountNavBar from '@/components/AccountNavBar';
import MusicianBio from '@/components/MusicianBio';
import ReviewForm from '@/components/ReviewForm';
import TipButton from '@/components/TipButton';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from '@/components/ui/carousel';
import { useConsumerStatus } from '@/contexts/ConsumerStatusContext';
import { toast } from '@/hooks/use-toast';

const NOW_DATE_STRING = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const EventMode = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { musicianId } = route.params ?? {};
  const locationStateMusician = route.params?.musician;

  const [musician, setMusician] = useState(locationStateMusician ?? null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!musician);

  const { checkOut } = useConsumerStatus();

  useEffect(() => {
    if (musician) {
      setIsLoading(false);
      return;
    }

    if (musicianId) {
      const mockMusician = {
        id: musicianId,
        name: 'Example Musician',
        genre: 'Jazz',
        bio: 'This talented musician has been performing for over 10 years across multiple venues.',
        image: 'https://placehold.co/400x400?text=Musician',
        following: 1243,
      };
      setMusician(mockMusician);
      setIsLoading(false);
    }
  }, [musician, musicianId]);

  const carouselItems = useMemo(
    () => [
      musician?.name ?? 'Now Playing',
      NOW_DATE_STRING,
      musician?.genre ? `Genre: ${musician.genre}` : 'Live Performance',
    ],
    [musician],
  );

  const handleFollow = () => {
    setIsFollowing((prev) => !prev);
    toast.show({
      title: isFollowing ? 'Unfollowed' : 'Following',
      description: isFollowing
        ? `You have unfollowed ${musician?.name}`
        : `You are now following ${musician?.name}`,
    });
  };

  const handleReviewToggle = () => {
    setIsReviewOpen((prev) => !prev);
  };

  const handleCheckOut = () => {
    checkOut();
    navigation.navigate('ConsumerHome');
  };

  const handleViewProfile = () => {
    navigation.navigate('MusicianProfile', { id: musicianId });
  };

  if (isLoading || !musician) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#f4f4f5" />
          <Text style={styles.mutedText}>Loading musician details...</Text>
          <Button onPress={() => navigation.navigate('ConsumerHome')} style={styles.homeButton}>
            Go Back Home
          </Button>
        </View>
        <AccountNavBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.nowPlaying}>
            <Text style={styles.nowPlayingText}>NOW PLAYING</Text>
            <Carousel>
              <CarouselContent style={styles.carouselContent}>
                {carouselItems.map((item, index) => (
                  <CarouselItem key={`${item}-${index}`} style={styles.carouselItem}>
                    <Text style={styles.carouselText}>{item}</Text>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </View>
        </View>

        <View style={styles.mainSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: musician.image ?? 'https://placehold.co/400x400?text=Musician' }}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>

          <MusicianBio bio={musician.bio} />

          <View style={styles.actionsRow}>
            <Button
              variant="outline"
              size="sm"
              onPress={handleFollow}
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
              ]}
              textStyle={isFollowing ? styles.followingText : styles.followText}
            >
              <Heart size={16} color={isFollowing ? '#f4f4f5' : '#0f172a'} />
              {isFollowing ? 'Following' : 'Follow'}
            </Button>

            <TipButton musicianName={musician.name} musicianId={musician.id} />

            <AlertDialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" onPress={handleReviewToggle}>
                  <Star size={16} color="#0f172a" />
                  Review
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent style={styles.alertContent}>
                <ReviewForm musicianId={musician.id} onClose={() => setIsReviewOpen(false)} />
              </AlertDialogContent>
            </AlertDialog>
          </View>

          <Button
            onPress={handleCheckOut}
            style={styles.checkoutButton}
            textStyle={styles.checkoutText}
          >
            CHECK OUT
          </Button>

          <Button
            variant="ghost"
            onPress={handleViewProfile}
            style={styles.profileButton}
            textStyle={styles.profileText}
          >
            View Profile
          </Button>
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
    paddingTop: 20,
    paddingBottom: 120,
    gap: 24,
    alignItems: 'center',
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
  homeButton: {
    marginTop: 8,
    backgroundColor: '#a855f7',
  },
  header: {
    width: '100%',
  },
  nowPlaying: {
    gap: 8,
  },
  nowPlayingText: {
    color: '#c084fc',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  carouselContent: {
    flexDirection: 'row',
  },
  carouselItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselText: {
    color: '#f4f4f5',
    fontSize: 16,
    fontWeight: '600',
  },
  mainSection: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  avatarWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    backgroundColor: '#27272a',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  followButton: {
    borderColor: '#a855f7',
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
  alertContent: {
    backgroundColor: '#18181b',
  },
  checkoutButton: {
    marginTop: 16,
    backgroundColor: '#ef4444',
    width: '70%',
  },
  checkoutText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  profileButton: {
    marginTop: 8,
  },
  profileText: {
    color: '#a855f7',
  },
});

export default EventMode;

