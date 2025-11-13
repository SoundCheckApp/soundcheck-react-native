import { useNavigation } from '@react-navigation/native';
import { Headphones, Music } from 'lucide-react-native';
import React from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import AccountNavBar from '@/components/AccountNavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SelectAccountTypePage() {
  const navigation = useNavigation();

  const handleSelect = (route) => {
    navigation.navigate(route);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrapper}>
          <Image
            source={{
              uri: 'https://cdn.builder.io/api/v1/image/assets/3628c6577eb34cf19edbf3167131a5d9/df4064c7c380b4bb0138a1edfaeaee073d637b89?placeholderIfAbsent=true',
            }}
            style={styles.logo}
          />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Select Account Type</Text>
          <Text style={styles.subtitle}>Choose the type of account you want to create</Text>
        </View>

        <View style={styles.cards}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => handleSelect('MusicianSignup')}>
            <Card style={styles.card}>
              <CardContent style={styles.cardContent}>
                <View style={styles.iconWrapper}>
                  <Music size={28} color="#f4f4f5" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Musician</Text>
                  <Text style={styles.cardSubtitle}>For artists and performers</Text>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={() => handleSelect('ConsumerSignup')}>
            <Card style={styles.card}>
              <CardContent style={styles.cardContent}>
                <View style={styles.iconWrapper}>
                  <Headphones size={28} color="#f4f4f5" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Music Consumer</Text>
                  <Text style={styles.cardSubtitle}>For music listeners and fans</Text>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Button variant="ghost" onPress={() => navigation.navigate('Login')}>
            Back to Login
          </Button>
        </View>
      </ScrollView>

      <AccountNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 120,
    gap: 24,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#f4f4f5',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  cards: {
    gap: 16,
  },
  card: {
    backgroundColor: '#18181b',
    borderColor: 'rgba(63,63,70,0.5)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: '#f4f4f5',
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
  },
});


