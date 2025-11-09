import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

/**
 * LaunchScreen component for React Native
 * Shows a splash screen with logo and tagline, then navigates to login
 * @param {Object} props - Component props
 * @param {string} props.imageSrc - Source URL for the logo image
 * @param {string} props.imageAlt - Alt text for the logo image
 */
const LaunchScreen = ({ imageSrc, imageAlt }) => {
  const [opacity] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useEffect(() => {
    // Reset opacity to 0 whenever component mounts
    opacity.setValue(0);
    
    // Start animation after a small delay to ensure it's visible
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 100);

    // After the animation completes, navigate to the login page
    const navigationTimer = setTimeout(() => {
      navigation.navigate('Login');
    }, 2000); // 2 seconds, adjust as needed

    return () => {
      clearTimeout(timer);
      clearTimeout(navigationTimer);
    };
  }, [navigation, opacity]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.imageContainer, { opacity }]}>
          <Image
            source={{ uri: imageSrc }}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel={imageAlt}
          />
        </Animated.View>
        <Animated.Text 
          style={[styles.tagline, { opacity }]}
        >
          Music Anytime… Anywhere
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    maxWidth: 300,
    paddingHorizontal: 38,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 50,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    color: '#F2FCE2',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default LaunchScreen;
