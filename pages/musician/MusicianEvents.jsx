import { useNavigation } from '@react-navigation/native';
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
import { Badge } from '@/components/ui/badge';
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
  { value: 'this-week', label: 'This Week', days: 7 },
  { value: 'this-month', label: 'This Month', days: 30 },
  { value: 'past-3-months', label: 'Past 3 Months', days: 90 },
  { value: 'past-6-months', label: 'Past 6 Months', days: 180 },
  { value: 'past-year', label: 'Past Year', days: 365 },
];

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
  if (Number.isNaN(diffMs) || diffMs <= 0) return 'Unknown';
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHours > 0) {
    return diffMins > 0 ? `${diffHours}h ${diffMins}m` : `${diffHours}h`;
  }
  return `${diffMins} minutes`;
};

const MusicianEvents = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [sortPeriod, setSortPeriod] = useState('past-year');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error('Error', 'You must be logged in to view events');
          return;
        }

        const { data, error } = await supabase
          .from('consumer_checkins')
          .select('*')
          .eq('musician_id', session.user.id)
          .order('event_date', { ascending: false });

        if (error) {
          toast.error('Error', 'Failed to load events');
          return;
        }

        setEvents(data ?? []);
      } catch (err) {
        toast.error('Error', 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sortPeriod);
    if (!option) return events;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - option.days);
    return events.filter((event) => new Date(event.event_date) >= cutoff);
  }, [events, sortPeriod]);

  const totalTips = useMemo(
    () => filteredEvents.reduce((sum, event) => sum + (Number(event.tip_amount) || 0), 0),
    [filteredEvents],
  );

  const averageRating = useMemo(() => {
    const ratings = filteredEvents.map((event) => Number(event.rating)).filter((rating) => rating);
    if (ratings.length === 0) return null;
    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    return total / ratings.length;
  }, [filteredEvents]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Events</Text>
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
        <Text style={styles.headerTitle}>My Events</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle style={styles.cardTitle}>Events Summary</CardTitle>
          </CardHeader>
          <CardContent style={styles.summaryGrid}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Events</Text>
              <Text style={styles.summaryValue}>{filteredEvents.length}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Tips</Text>
              <Text style={styles.summaryValue}>${totalTips.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Avg Rating</Text>
              <Text style={styles.summaryValue}>
                {averageRating !== null ? averageRating.toFixed(1) : 'N/A'}
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardContent>
            <Select value={sortPeriod} onValueChange={setSortPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
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
          <CardHeader>
            <CardTitle style={styles.cardTitle}>Past Events</CardTitle>
          </CardHeader>
          <CardContent style={styles.eventsList}>
            {filteredEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.mutedText}>
                  No events found. Start performing to see your event history here!
                </Text>
              </View>
            ) : (
              filteredEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventRow}
                  onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                >
                  <View style={styles.eventDateColumn}>
                    <Text style={styles.eventDate}>{formatDate(event.event_date)}</Text>
                    <Text style={styles.eventTime}>
                      {formatTime(event.event_start_time)} - {formatTime(event.event_end_time)}
                    </Text>
                  </View>
                  <Text style={styles.eventDuration}>
                    {calculateDuration(event.event_start_time, event.event_end_time)}
                  </Text>
                  <Badge style={styles.locationBadge}>{event.location}</Badge>
                </TouchableOpacity>
              ))
            )}
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 14,
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
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.6)',
    paddingVertical: 16,
    backgroundColor: 'rgba(24,24,35,0.7)',
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  summaryValue: {
    color: '#f4f4f5',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  eventsList: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  mutedText: {
    color: '#a1a1aa',
    textAlign: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(24,24,35,0.9)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.4)',
    gap: 12,
  },
  eventDateColumn: {
    flex: 1,
    gap: 4,
  },
  eventDate: {
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '600',
  },
  eventTime: {
    color: '#9399b2',
    fontSize: 12,
  },
  eventDuration: {
    color: '#f4f4f5',
    fontSize: 14,
    minWidth: 90,
    textAlign: 'center',
  },
  locationBadge: {
    borderColor: 'rgba(148,163,184,0.5)',
    backgroundColor: 'rgba(63,63,70,0.6)',
    color: '#f4f4f5',
  },
});

export default MusicianEvents;

