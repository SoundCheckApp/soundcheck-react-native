import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NotFound = () => {
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', route.name);
  }, [route.name]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Oops! Page not found</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Index')}>
          <Text style={styles.link}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b0b12',
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#f4f4f5',
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
  },
  link: {
    fontSize: 16,
    color: '#60a5fa',
    textDecorationLine: 'underline',
  },
});

export default NotFound;

