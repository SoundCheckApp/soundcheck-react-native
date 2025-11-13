import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Clock, DollarSign, MapPin, Star } from 'lucide-react-native';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SORT_OPTIONS = [
  { value: 'date', label: 'Date (Newest First)' },
  { value: 'location', label: 'Location (A-Z)' },
  { value: 'rating', label: 'Rating (Highest First)' },
  { value: 'tips', label: 'Tips (Highest First)' },
];

const ConsumerEvents = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error('Error', 'You must be logged in to view events');
          return;
        }

        let query = supabase
          .from('consumer_checkins')
          .select(
            `
            *,
            musicians (
              artist_name,
              first_name,
              last_name,
              genre
            )
          `,
          )
          .eq('consumer_id', session.user.id);

        switch (sortBy) {
          case 'date':
            query = query.order('event_date', { ascending: false });
            break;
          case 'location':
            query = query.order('location', { ascending: true });
            break;
          case 'rating':
            query = query.order('rating', { ascending: false });
            break;
          case 'tips':
            query = query.order('tip_amount', { ascending: false });
            break;
          default:
            break;
        }

        const { data: checkins, error } = await query;

        if (error) {
          toast.error('Error', 'Failed to fetch events');
          return;
        }

        setEvents(checkins ?? []);
      } catch (err) {
        toast.error('Error', 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [sortBy]);

  const totalTips = useMemo(() => {
    return events.reduce(
      (sum, event) => sum + (Number.parseFloat(event.tip_amount) || 0),
      0,
    );
  }, [events]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderRating = (rating) => {
    if (!rating) {
      return <Text style={styles.mutedText}>No rating</Text>;
    }

    return (
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= rating ? '#facc15' : '#4b5563'}
            fill={star <= rating ? '#facc15' : 'none'}
          />
        ))}
        <Text style={styles.ratingText}>({rating})</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('ConsumerHome')}
          >
            <ArrowLeft size={20} color="#a1a1aa" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Events</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#f4f4f5" />
          <Text style={styles.loadingText}>Loading events...</Text>
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
          onPress={() => navigation.navigate('ConsumerHome')}
        >
          <ArrowLeft size={20} color="#a1a1aa" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Events</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle style={styles.cardTitle}>Sort Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Select sort order" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardContent style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryValue}>{events.length}</Text>
                <Text style={styles.summaryLabel}>Total Events</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryValue}>${totalTips.toFixed(2)}</Text>
                <Text style={styles.summaryLabel}>Total Tips Given</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <View style={styles.eventsList}>
          {events.length > 0 ? (
            events.map((event) => (
              <Card
                key={event.id}
                style={styles.card}
                onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
              >
                <CardContent style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <View>
                      <Text style={styles.eventTitle}>
                        {event.musicians?.artist_name ||
                          [event.musicians?.first_name, event.musicians?.last_name]
                            .filter(Boolean)
                            .join(' ') ||
                          'Unknown Musician'}
                      </Text>
                      {event.musicians?.genre ? (
                        <Text style={styles.eventGenre}>{event.musicians.genre}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.eventDate}>{formatDate(event.event_date)}</Text>
                  </View>

                  <View style={styles.eventDetails}>
                    <View style={styles.detailColumn}>
                      <View style={styles.detailRow}>
                        <MapPin size={16} color="#a1a1aa" />
                        <Text style={styles.detailText}>{event.location}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Clock size={16} color="#a1a1aa" />
                        <Text style={styles.detailText}>
                          {formatTime(event.event_start_time)} - {formatTime(event.event_end_time)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailColumn}>
                      <View style={styles.detailRow}>
                        <DollarSign size={16} color="#22c55e" />
                        <Text style={styles.detailText}>
                          Tip: ${Number.parseFloat(event.tip_amount || 0).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>{renderRating(event.rating)}</View>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <CardContent style={styles.emptyContent}>
                <Text style={styles.mutedText}>No events found</Text>
                <Text style={styles.subtleText}>Start attending events to see them here!</Text>
              </CardContent>
            </Card>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  headerTitle: {
    color: '#f4f4f5',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  card: {
    backgroundColor: '#18181b',
    borderColor: 'rgba(63,63,70,0.6)',
  },
  cardTitle: {
    color: '#f4f4f5',
    fontSize: 16,
  },
  summaryContent: {
    gap: 16,
    paddingVertical: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.6)',
    paddingVertical: 16,
    backgroundColor: 'rgba(24,24,35,0.9)',
    alignItems: 'center',
  },
  summaryValue: {
    color: '#f4f4f5',
    fontSize: 22,
    fontWeight: '700',
  },
  summaryLabel: {
    color: '#a1a1aa',
    fontSize: 12,
    marginTop: 4,
  },
  eventsList: {
    gap: 16,
  },
  eventContent: {
    gap: 12,
    paddingVertical: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventTitle: {
    color: '#f4f4f5',
    fontSize: 16,
    fontWeight: '600',
  },
  eventGenre: {
    color: '#a1a1aa',
    fontSize: 13,
    marginTop: 4,
  },
  eventDate: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailColumn: {
    flex: 1,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#f4f4f5',
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    color: '#d4d4d8',
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: 'rgba(24,24,35,0.9)',
  },
  emptyContent: {
    alignItems: 'center',
    gap: 12,
  },
  mutedText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  subtleText: {
    color: '#71717a',
    fontSize: 13,
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
});

export default ConsumerEvents;

