import { Star, UserX } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import AccountNavBar from '@/components/AccountNavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartLine } from '@/components/ui/chart-line';
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
  { value: 'tips', label: 'Tips' },
  { value: 'ratings', label: 'Ratings' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'followers', label: 'Followers' },
];

const FILTER_OPTIONS = {
  tips: [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ],
  ratings: [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
  ],
  reviews: [
    { value: 'weekly', label: 'Past Week' },
    { value: 'monthly', label: 'Past Month' },
    { value: 'yearly', label: 'Past Year' },
    { value: 'all', label: 'All Time' },
  ],
  followers: [{ value: 'all', label: 'All' }],
};

const DEFAULT_FILTER = {
  tips: 'monthly',
  ratings: 'all',
  reviews: 'monthly',
  followers: 'all',
};

const MusicianInsights = () => {
  const [insightType, setInsightType] = useState('tips');
  const [filterValue, setFilterValue] = useState(DEFAULT_FILTER.tips);

  const [tipsData, setTipsData] = useState([]);
  const [totalTips, setTotalTips] = useState(null);

  const [ratingsData, setRatingsData] = useState([]);
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);

  const [reviewsData, setReviewsData] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const [followersData, setFollowersData] = useState([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(true);
  const [blockingConsumerId, setBlockingConsumerId] = useState(null);

  useEffect(() => {
    const loadRatings = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('consumer_reviews')
          .select(
            `
            rating,
            created_at,
            consumers (
              first_name,
              last_name,
              username
            )
          `,
          )
          .eq('musician_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!error) {
          setRatingsData(data ?? []);
        }
      } catch (err) {
        toast.error('Error', 'Failed to fetch ratings');
      } finally {
        setIsLoadingRatings(false);
      }
    };

    loadRatings();
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('consumer_reviews')
          .select(
            `
            rating,
            review_text,
            created_at,
            consumers (
              first_name,
              last_name,
              username
            )
          `,
          )
          .eq('musician_id', session.user.id)
          .not('review_text', 'is', null)
          .order('created_at', { ascending: false });

        if (!error) {
          setReviewsData(data ?? []);
        }
      } catch (err) {
        toast.error('Error', 'Failed to fetch reviews');
      } finally {
        setIsLoadingReviews(false);
      }
    };

    loadReviews();
  }, []);

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('consumer_follows')
          .select(
            `
            created_at,
            consumer_id,
            consumers (
              first_name,
              last_name,
              username,
              location
            )
          `,
          )
          .eq('musician_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!error) {
          setFollowersData(data ?? []);
        }
      } catch (err) {
        toast.error('Error', 'Failed to fetch followers');
      } finally {
        setIsLoadingFollowers(false);
      }
    };

    loadFollowers();
  }, []);

  const handleBlockConsumer = async (consumerId, consumerName) => {
    try {
      setBlockingConsumerId(consumerId);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Error', 'You must be logged in to block users');
        return;
      }

      const { error } = await supabase.from('consumer_blocks').insert({
        musician_id: session.user.id,
        consumer_id: consumerId,
      });

      if (error) {
        throw error;
      }

      setFollowersData((prev) => prev.filter((follower) => follower.consumer_id !== consumerId));
      toast.success('User Blocked', `${consumerName} has been blocked successfully`);
    } catch (err) {
      toast.error('Error', 'Failed to block user. Please try again.');
    } finally {
      setBlockingConsumerId(null);
    }
  };

  const handleInsightTypeChange = (value) => {
    setInsightType(value);
    setFilterValue(DEFAULT_FILTER[value]);
  };

  const handleFilterChange = (value) => {
    setFilterValue(value);
    if (insightType === 'tips') {
      toast.show({ title: 'View Updated', description: `Showing ${value} data` });
      setTipsData([]);
      setTotalTips(null);
    }
  };

  const filteredRatings = useMemo(() => {
    if (filterValue === 'all') return ratingsData;
    const ratingValue = Number.parseInt(filterValue, 10);
    return ratingsData.filter((item) => item.rating === ratingValue);
  }, [ratingsData, filterValue]);

  const filteredReviews = useMemo(() => {
    if (filterValue === 'all') return reviewsData;
    const now = new Date();
    const cutoff = new Date();

    if (filterValue === 'weekly') {
      cutoff.setDate(now.getDate() - 7);
    } else if (filterValue === 'monthly') {
      cutoff.setMonth(now.getMonth() - 1);
    } else if (filterValue === 'yearly') {
      cutoff.setFullYear(now.getFullYear() - 1);
    }

    return reviewsData.filter((review) => new Date(review.created_at) >= cutoff);
  }, [reviewsData, filterValue]);

  const ratingsBreakdown = useMemo(
    () =>
      [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count: ratingsData.filter((item) => item.rating === rating).length,
      })),
    [ratingsData],
  );

  const renderStars = (rating) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          color={star <= rating ? '#facc15' : '#4b5563'}
          fill={star <= rating ? '#facc15' : 'none'}
        />
      ))}
    </View>
  );

  const renderTipsContent = () => (
    <View style={styles.sectionGap}>
      <Card style={styles.card}>
        <CardHeader>
          <CardTitle style={styles.cardTitle}>Total Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <Text style={styles.metricLarge}>{totalTips !== null ? `$${totalTips.toFixed(2)}` : '--'}</Text>
        </CardContent>
      </Card>

      <Card style={styles.card}>
        <CardHeader>
          <CardTitle style={styles.cardTitle}>Tips Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {tipsData.length > 0 ? (
            <ChartLine data={tipsData} />
          ) : (
            <Text style={styles.mutedText}>No tip data available for the selected time frame</Text>
          )}
        </CardContent>
      </Card>
    </View>
  );

  const renderRatingsContent = () => (
    <Card style={styles.card}>
      <CardHeader>
        <CardTitle style={styles.cardTitle}>Ratings Received</CardTitle>
      </CardHeader>
      <CardContent style={styles.sectionGap}>
        {isLoadingRatings ? (
          <Text style={styles.mutedText}>Loading ratings...</Text>
        ) : ratingsData.length === 0 ? (
          <Text style={styles.mutedText}>No ratings received yet</Text>
        ) : (
          <>
            <View style={styles.ratingGrid}>
              {ratingsBreakdown.map(({ rating, count }) => (
                <View key={rating} style={styles.ratingSummary}>
                  {renderStars(rating)}
                  <Text style={styles.ratingCount}>{count}</Text>
                  <Text style={styles.ratingLabel}>
                    {rating} Star{rating !== 1 ? 's' : ''}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.listGap}>
              {filteredRatings.slice(0, 10).map((rating, index) => (
                <View key={`${rating.created_at}-${index}`} style={styles.listRow}>
                  <View style={styles.listRowContent}>
                    {renderStars(rating.rating)}
                    <Text style={styles.listRowText}>
                      by{' '}
                      {rating.consumers?.username ||
                        [rating.consumers?.first_name, rating.consumers?.last_name]
                          .filter(Boolean)
                          .join(' ') ||
                        'Anonymous'}
                    </Text>
                  </View>
                  <Text style={styles.listRowDate}>
                    {new Date(rating.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderReviewsContent = () => (
    <Card style={styles.card}>
      <CardHeader>
        <CardTitle style={styles.cardTitle}>Reviews Received</CardTitle>
      </CardHeader>
      <CardContent style={styles.sectionGap}>
        {isLoadingReviews ? (
          <Text style={styles.mutedText}>Loading reviews...</Text>
        ) : reviewsData.length === 0 ? (
          <Text style={styles.mutedText}>No reviews received yet</Text>
        ) : (
          <View style={styles.listGap}>
            {filteredReviews.map((review, index) => (
              <View key={`${review.created_at}-${index}`} style={styles.reviewCard}>
                <View style={styles.listRow}>
                  <View style={styles.listRowContent}>
                    {renderStars(review.rating)}
                    <Text style={styles.listRowText}>
                      by{' '}
                      {review.consumers?.username ||
                        [review.consumers?.first_name, review.consumers?.last_name]
                          .filter(Boolean)
                          .join(' ') ||
                        'Anonymous'}
                    </Text>
                  </View>
                  <Text style={styles.listRowDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.reviewText}>{review.review_text}</Text>
              </View>
            ))}
            {filteredReviews.length === 0 ? (
              <Text style={styles.mutedText}>No reviews found for the selected filter</Text>
            ) : null}
          </View>
        )}
      </CardContent>
    </Card>
  );

  const renderFollowersContent = () => (
    <Card style={styles.card}>
      <CardHeader>
        <CardTitle style={styles.cardTitle}>Followers</CardTitle>
      </CardHeader>
      <CardContent style={styles.sectionGap}>
        {isLoadingFollowers ? (
          <Text style={styles.mutedText}>Loading followers...</Text>
        ) : followersData.length === 0 ? (
          <Text style={styles.mutedText}>No followers yet</Text>
        ) : (
          <View style={styles.listGap}>
            {followersData.map((follower) => {
              const displayName =
                follower.consumers?.username ||
                [follower.consumers?.first_name, follower.consumers?.last_name]
                  .filter(Boolean)
                  .join(' ') ||
                'Anonymous';

              return (
                <View key={follower.consumer_id} style={styles.followerRow}>
                  <View style={styles.followerInfo}>
                    <Text style={styles.followerName}>{displayName}</Text>
                    {follower.consumers?.location ? (
                      <Text style={styles.followerLocation}>{follower.consumers.location}</Text>
                    ) : null}
                    <Text style={styles.listRowDate}>
                      Followed on {new Date(follower.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={blockingConsumerId === follower.consumer_id}
                    onPress={() => handleBlockConsumer(follower.consumer_id, displayName)}
                    textStyle={styles.blockButtonText}
                  >
                    <UserX size={14} color="#fef2f2" />
                    {blockingConsumerId === follower.consumer_id ? 'Blocking...' : 'Block'}
                  </Button>
                </View>
              );
            })}
          </View>
        )}
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (insightType) {
      case 'tips':
        return renderTipsContent();
      case 'ratings':
        return renderRatingsContent();
      case 'reviews':
        return renderReviewsContent();
      case 'followers':
        return renderFollowersContent();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.selectionContainer}>
          <View>
            <Text style={styles.sectionLabel}>Insight Type</Text>
            <Select value={insightType} onValueChange={handleInsightTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select insight type" />
              </SelectTrigger>
              <SelectContent>
                {INSIGHT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </View>

          <View>
            <Text style={styles.sectionLabel}>
              {insightType === 'tips'
                ? 'Time Frame'
                : insightType === 'ratings'
                  ? 'Filter by Rating'
                  : insightType === 'followers'
                    ? 'Filter'
                    : 'Time Frame'}
            </Text>
            <Select value={filterValue} onValueChange={handleFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS[insightType].map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </View>
        </View>

        {renderContent()}
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
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 20,
  },
  selectionContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#18181b',
    borderColor: 'rgba(63,63,70,0.6)',
  },
  cardTitle: {
    color: '#f4f4f5',
  },
  sectionGap: {
    gap: 16,
  },
  sectionLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  metricLarge: {
    color: '#f4f4f5',
    fontSize: 32,
    fontWeight: '700',
  },
  mutedText: {
    color: '#9ca3af',
    textAlign: 'center',
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  ratingSummary: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    gap: 6,
  },
  ratingCount: {
    color: '#f4f4f5',
    fontSize: 18,
    fontWeight: '700',
  },
  ratingLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  listGap: {
    gap: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(24,24,35,0.9)',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.4)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  listRowText: {
    color: '#cbd5f5',
    fontSize: 13,
  },
  listRowDate: {
    color: '#9ca3af',
    fontSize: 12,
  },
  reviewCard: {
    backgroundColor: 'rgba(24,24,35,0.95)',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.5)',
    padding: 16,
    gap: 12,
  },
  reviewText: {
    color: '#f4f4f5',
    fontSize: 14,
    lineHeight: 20,
  },
  followerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(24,24,35,0.9)',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.4)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  followerInfo: {
    flex: 1,
    gap: 4,
  },
  followerName: {
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '600',
  },
  followerLocation: {
    color: '#9ca3af',
    fontSize: 12,
  },
  blockButtonText: {
    color: '#fef2f2',
    fontSize: 13,
  },
});

export default MusicianInsights;

