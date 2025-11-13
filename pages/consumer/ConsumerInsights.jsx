import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, DollarSign, Shield, Star, UserMinus } from 'lucide-react-native';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartBars } from '@/components/ui/chart-bars';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const INSIGHT_OPTIONS = [
  { value: 'tips', label: 'Tips Given' },
  { value: 'reviews', label: 'Reviews Given' },
  { value: 'following', label: 'Following' },
];

const TIME_PERIOD_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const STAR_OPTIONS = [
  { value: 'all', label: 'All Reviews' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
];

const ConsumerInsights = () => {
  const navigation = useNavigation();
  const [insightType, setInsightType] = useState('tips');
  const [timePeriod, setTimePeriod] = useState('weekly');
  const [starFilter, setStarFilter] = useState('all');
  const [tipsData, setTipsData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [totalTips, setTotalTips] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalFollowing, setTotalFollowing] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error('Error', 'You must be logged in to view insights');
          return;
        }

        if (insightType === 'tips') {
          await fetchTips(session.user.id);
        } else if (insightType === 'reviews') {
          await fetchReviews(session.user.id);
        } else {
          await fetchFollowing(session.user.id);
        }
      } catch (err) {
        toast.error('Error', 'Failed to fetch insights data');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [insightType, timePeriod, starFilter]);

  const fetchTips = async (userId) => {
    const now = new Date();
    const startDate = new Date();

    if (timePeriod === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (timePeriod === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const { data: tips, error } = await supabase
      .from('consumer_tips')
      .select(
        `
        *,
        musicians (
          artist_name,
          first_name,
          last_name
        )
      `,
      )
      .eq('consumer_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const processed = processTipsForChart(tips ?? [], timePeriod);
    setTipsData(processed);

    const total = (tips ?? []).reduce((sum, tip) => sum + (Number(tip.amount) || 0), 0);
    setTotalTips(total);
  };

  const fetchReviews = async (userId) => {
    let query = supabase
      .from('consumer_reviews')
      .select(
        `
        *,
        musicians (
          artist_name,
          first_name,
          last_name
        )
      `,
      )
      .eq('consumer_id', userId)
      .order('created_at', { ascending: false });

    if (starFilter !== 'all') {
      query = query.eq('rating', Number.parseInt(starFilter, 10));
    }

    const { data: reviews, error } = await query;
    if (error) {
      throw error;
    }

    setReviewsData(reviews ?? []);
    setTotalReviews((reviews ?? []).length);
  };

  const fetchFollowing = async (userId) => {
    const { data: follows, error } = await supabase
      .from('consumer_follows')
      .select(
        `
        *,
        musicians (
          id,
          artist_name,
          first_name,
          last_name
        )
      `,
      )
      .eq('consumer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    setFollowingData(follows ?? []);
    setTotalFollowing((follows ?? []).length);
  };

  const handleUnfollow = async (musicianId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Error', 'You must be logged in to unfollow');
        return;
      }

      const { error } = await supabase
        .from('consumer_follows')
        .delete()
        .eq('consumer_id', session.user.id)
        .eq('musician_id', musicianId);

      if (error) {
        throw error;
      }

      toast.success('Success', 'Successfully unfollowed musician');
      await fetchFollowing(session.user.id);
    } catch (err) {
      toast.error('Error', 'Failed to unfollow musician');
    }
  };

  const handleBlock = async (musicianId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Error', 'You must be logged in to block');
        return;
      }

      await supabase
        .from('consumer_follows')
        .delete()
        .eq('consumer_id', session.user.id)
        .eq('musician_id', musicianId);

      const { error } = await supabase.from('consumer_blocks').insert({
        consumer_id: session.user.id,
        musician_id: musicianId,
      });

      if (error) {
        throw error;
      }

      toast.success('Success', 'Successfully blocked musician');
      await fetchFollowing(session.user.id);
    } catch (err) {
      toast.error('Error', 'Failed to block musician');
    }
  };

  const processTipsForChart = (tips, period) => {
    const grouped = {};

    tips.forEach((tip) => {
      const date = new Date(tip.created_at);
      let key;

      if (period === 'weekly') {
        key = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (period === 'monthly') {
        key = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }

      grouped[key] = (grouped[key] ?? 0) + (Number(tip.amount) || 0);
    });

    return Object.entries(grouped).map(([periodLabel, amount]) => ({
      period: periodLabel,
      amount: Math.round(amount * 100) / 100,
    }));
  };

  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
      stars.push(
        <Star key={i} size={16} color={i <= rating ? '#facc15' : '#4b5563'} fill={i <= rating ? '#facc15' : 'none'} />,
      );
    }
    return <View style={styles.ratingRow}>{stars}</View>;
  };

  const headerTitle = useMemo(() => 'Insights', []);

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
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#f4f4f5" />
          <Text style={styles.loadingText}>Loading insights...</Text>
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
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle style={styles.cardTitle}>View Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={insightType} onValueChange={setInsightType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSIGHT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {insightType === 'tips' ? (
          <>
            <Card style={styles.card}>
              <CardContent>
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_PERIOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card style={styles.card}>
              <CardContent style={styles.metricRow}>
                <DollarSign size={24} color="#22c55e" />
                <View>
                  <Text style={styles.metricLabel}>Total Tips Given</Text>
                  <Text style={styles.metricValue}>${totalTips.toFixed(2)}</Text>
                </View>
              </CardContent>
            </Card>

            <Card style={styles.card}>
              <CardHeader>
                <CardTitle style={styles.cardTitle}>Tips Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {tipsData.length > 0 ? (
                  <ChartBars data={tipsData} />
                ) : (
                  <Text style={styles.mutedText}>No tips data available for this period</Text>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}

        {insightType === 'reviews' ? (
          <>
            <Card style={styles.card}>
              <CardContent>
                <Select value={starFilter} onValueChange={setStarFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card style={styles.card}>
              <CardContent style={styles.metricRow}>
                <Star size={24} color="#facc15" />
                <View>
                  <Text style={styles.metricLabel}>Total Reviews Given</Text>
                  <Text style={styles.metricValue}>{totalReviews}</Text>
                </View>
              </CardContent>
            </Card>

            <View style={styles.list}>
              {reviewsData.length > 0 ? (
                reviewsData.map((review) => (
                  <Card key={review.id} style={styles.card}>
                    <CardContent style={styles.reviewContent}>
                      <View style={styles.reviewHeader}>
                        <View>
                          <Text style={styles.reviewTitle}>
                            Review for{' '}
                            {review.musicians?.artist_name ||
                              [review.musicians?.first_name, review.musicians?.last_name]
                                .filter(Boolean)
                                .join(' ') ||
                              'Unknown Musician'}
                          </Text>
                          <Text style={styles.reviewDate}>
                            {new Date(review.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        {renderStarRating(review.rating)}
                      </View>
                      {review.review_text ? (
                        <Text style={styles.reviewText}>{review.review_text}</Text>
                      ) : null}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card style={styles.card}>
                  <CardContent style={styles.emptyState}>
                    <Text style={styles.mutedText}>No reviews found</Text>
                  </CardContent>
                </Card>
              )}
            </View>
          </>
        ) : null}

        {insightType === 'following' ? (
          <>
            <Card style={styles.card}>
              <CardContent>
                <Select value="all" disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card style={styles.card}>
              <CardContent style={styles.metricRow}>
                <Star size={24} color="#38bdf8" />
                <View>
                  <Text style={styles.metricLabel}>Musicians Following</Text>
                  <Text style={styles.metricValue}>{totalFollowing}</Text>
                </View>
              </CardContent>
            </Card>

            <View style={styles.list}>
              {followingData.length > 0 ? (
                followingData.map((follow) => (
                  <Card key={follow.id} style={styles.card}>
                    <CardContent style={styles.followContent}>
                      <View>
                        <Text style={styles.followTitle}>
                          {follow.musicians?.artist_name ||
                            [follow.musicians?.first_name, follow.musicians?.last_name]
                              .filter(Boolean)
                              .join(' ') ||
                            'Unknown Musician'}
                        </Text>
                        <Text style={styles.followDate}>
                          Following since {new Date(follow.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.followActions}>
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => handleUnfollow(follow.musician_id)}
                          style={styles.unfollowButton}
                          textStyle={styles.unfollowText}
                        >
                          <UserMinus size={14} color="#facc15" />
                          Unfollow
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => handleBlock(follow.musician_id)}
                          style={styles.blockButton}
                          textStyle={styles.blockText}
                        >
                          <Shield size={14} color="#ef4444" />
                          Block
                        </Button>
                      </View>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card style={styles.card}>
                  <CardContent style={styles.emptyState}>
                    <Text style={styles.mutedText}>You are not following any musicians yet</Text>
                  </CardContent>
                </Card>
              )}
            </View>
          </>
        ) : null}
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
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#f4f4f5',
  },
  card: {
    backgroundColor: '#18181b',
    borderColor: 'rgba(63,63,70,0.6)',
  },
  cardTitle: {
    color: '#f4f4f5',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricLabel: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  metricValue: {
    color: '#f4f4f5',
    fontSize: 24,
    fontWeight: '700',
  },
  mutedText: {
    color: '#a1a1aa',
    textAlign: 'center',
  },
  list: {
    gap: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewContent: {
    gap: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  reviewTitle: {
    color: '#f4f4f5',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewDate: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  reviewText: {
    color: '#cbd5f5',
    fontSize: 13,
    lineHeight: 19,
  },
  followContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  followTitle: {
    color: '#f4f4f5',
    fontSize: 14,
    fontWeight: '600',
  },
  followDate: {
    color: '#a1a1aa',
    fontSize: 12,
    marginTop: 2,
  },
  followActions: {
    flexDirection: 'row',
    gap: 8,
  },
  unfollowButton: {
    borderColor: '#facc15',
    backgroundColor: 'transparent',
  },
  unfollowText: {
    color: '#facc15',
    fontSize: 13,
  },
  blockButton: {
    borderColor: '#ef4444',
    backgroundColor: 'transparent',
  },
  blockText: {
    color: '#ef4444',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
});

export default ConsumerInsights;

