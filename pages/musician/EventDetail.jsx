import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Star } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import AccountNavBar from '@/components/AccountNavBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatTime = (timeString) =>
  new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

const calculateDuration = (startTime, endTime) => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diffMs = end.getTime() - start.getTime();
  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return 'Unknown duration';
  }
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHours > 0) {
    return diffMins > 0
      ? `${diffHours}h ${diffMins}m`
      : `${diffHours}h`;
  }
  return `${diffMins} minutes`;
};

const renderRating = (rating) => {
  if (!rating) {
    return <Text style={styles.mutedText}>No rating</Text>;
  }
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  for (let i = 0; i < fullStars; i += 1) {
    stars.push(<Star key={`full-${i}`} size={16} color="#facc15" fill="#facc15" />);
  }
  if (hasHalfStar) {
    stars.push(
      <View key="half" style={{ position: 'relative' }}>
        <Star size={16} color="#facc15" />
        <View style={styles.halfStar}>
          <Star size={16} color="#facc15" fill="#facc15" />
        </View>
      </View>,
    );
  }
  return (
    <View style={styles.ratingRow}>
      {stars}
      <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
    </View>
  );
};

const EventDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params ?? {};

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error('Error', 'You must be logged in to view event details');
          navigation.navigate('MusicianEvents');
          return;
        }

        const { data, error } = await supabase
          .from('consumer_checkins')
          .select('*')
          .eq('id', eventId)
          .eq('musician_id', session.user.id)
          .single();

        if (error) {
          toast.error('Error', 'Failed to load event details');
          navigation.navigate('MusicianEvents');
          return;
        }

        setEvent(data);
      } catch (err) {
        toast.error('Error', 'An unexpected error occurred');
        navigation.navigate('MusicianEvents');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, navigation]);

  const headerTitle = useMemo(() => 'Event Details', []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('MusicianEvents')}
          >
            <ArrowLeft size={20} color="#f4f4f5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#f4f4f5" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
        <AccountNavBar />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('MusicianEvents')}
          >
            <ArrowLeft size={20} color="#f4f4f5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.mutedText}>Event not found</Text>
          <Button
            onPress={() => navigation.navigate('MusicianEvents')}
            style={styles.backToEventsButton}
            textStyle={styles.backToEventsText}
          >
            Back to Events
          </Button>
        </View>
        <AccountNavBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('MusicianEvents')}
        >
          <ArrowLeft size={20} color="#f4f4f5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle style={styles.cardTitle}>{formatDate(event.event_date)}</CardTitle>
            <Text style={styles.timeRange}>
              {formatTime(event.event_start_time)} - {formatTime(event.event_end_time)}
            </Text>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Duration</Text>
              <Text style={styles.sectionValue}>
                {calculateDuration(event.event_start_time, event.event_end_time)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Location</Text>
              <Badge style={styles.locationBadge}>{event.location}</Badge>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tips Earned</Text>
              <Text style={styles.tipsValue}>
                ${Number.parseFloat(event.tip_amount ?? 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Rating</Text>
              {renderRating(event.rating)}
            </View>
          </CardContent>
        </Card>
      </View>

      <AccountNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b0b12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.5)',
  },
  backButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(244,244,245,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#f4f4f5',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 36,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#f4f4f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#18181b',
    borderColor: 'rgba(63,63,70,0.6)',
  },
  cardTitle: {
    color: '#f4f4f5',
    fontSize: 20,
    fontWeight: '600',
  },
  timeRange: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  cardContent: {
    gap: 20,
    paddingVertical: 16,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '500',
  },
  sectionValue: {
    color: '#f4f4f5',
    fontSize: 16,
    fontWeight: '600',
  },
  locationBadge: {
    borderColor: 'rgba(148,163,184,0.4)',
    backgroundColor: 'rgba(63,63,70,0.5)',
    color: '#f4f4f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  tipsValue: {
    color: '#34d399',
    fontSize: 18,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingValue: {
    color: '#f4f4f5',
    fontSize: 14,
  },
  mutedText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  halfStar: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    width: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  backToEventsButton: {
    backgroundColor: '#f4f4f5',
  },
  backToEventsText: {
    color: '#0b0b12',
    fontWeight: '600',
  },
});

export default EventDetail;

