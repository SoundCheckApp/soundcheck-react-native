import { useNavigation } from '@react-navigation/native';
import { MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import AccountNavBar from '@/components/AccountNavBar';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GRID_ROWS = 12;
const GRID_COLS = 8;

const MusicianHomepage = () => {
  const navigation = useNavigation();
  const [balance, setBalance] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [musicianId, setMusicianId] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  const fetchBalance = async (userId) => {
    try {
      const { data, error } = await supabase.rpc('get_musician_balance', {
        musician_uuid: userId,
      });

      if (error) {
        console.error('Error fetching balance:', error);
        return;
      }

      setBalance(Number(data) || 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const userId = session.user.id;
        setMusicianId(userId);
        await fetchBalance(userId);
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    if (!musicianId) return;

    const channel = supabase
      .channel('musician-earnings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'musician_earnings',
          filter: `musician_id=eq.${musicianId}`,
        },
        (payload) => {
          fetchBalance(musicianId);
          if (payload.new.source_type === 'tip') {
            toast.success('New Tip Received!', `You received $${payload.new.amount}`);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [musicianId]);

  const handleGoLive = () => {
    setIsLive((prev) => !prev);
    if (!isLive) {
      toast.success("You're Live!", 'Your followers in the area have been notified');
    } else {
      toast.success("You're Offline", "You've ended your live session");
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.background}>
          {Array.from({ length: GRID_ROWS }).map((_, index) => (
            <View key={`row-${index}`} style={[styles.horizontalLine, { top: `${(index + 1) * 8}%` }]} />
          ))}
          {Array.from({ length: GRID_COLS }).map((_, index) => (
            <View key={`col-${index}`} style={[styles.verticalLine, { left: `${(index + 1) * 12.5}%` }]} />
          ))}
        </View>

        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>BALANCE</Text>
            <Text style={styles.balanceValue}>
              {isLoadingBalance ? '...' : `$${balance.toFixed(2)}`}
            </Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.markerWrapper}>
            <View style={styles.markerGlow} />
            <MapPin size={96} color="#ef4444" />
          </View>

          <Button
            onPress={handleGoLive}
            style={[
              styles.goLiveButton,
              isLive ? styles.liveButton : styles.offlineButton,
            ]}
            textStyle={styles.goLiveText}
          >
            {isLive ? 'END LIVE' : 'GO LIVE!'}
          </Button>
        </View>
      </View>

      <AccountNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  horizontalLine: {
    position: 'absolute',
    height: StyleSheet.hairlineWidth,
    width: '100%',
    backgroundColor: 'rgba(82,82,91,0.3)',
  },
  verticalLine: {
    position: 'absolute',
    height: '100%',
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(82,82,91,0.3)',
  },
  balanceContainer: {
    paddingHorizontal: 24,
  },
  balanceCard: {
    backgroundColor: '#000000',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#94a3b8',
    fontSize: 12,
    letterSpacing: 1,
  },
  balanceValue: {
    color: '#f4f4f5',
    fontSize: 24,
    fontWeight: '700',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(239,68,68,0.2)',
    opacity: 0.5,
  },
  goLiveButton: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 999,
  },
  liveButton: {
    backgroundColor: '#3f3f46',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#71717a',
  },
  offlineButton: {
    backgroundColor: '#ef4444',
  },
  goLiveText: {
    color: '#f4f4f5',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default MusicianHomepage;

