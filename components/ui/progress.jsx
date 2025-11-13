import React, { forwardRef, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

export const Progress = forwardRef(
  ({ style, value = 0, duration = 200, ...props }, ref) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const clampedValue = Math.min(Math.max(value, 0), 100);
      Animated.timing(animatedValue, {
        toValue: clampedValue,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }, [value, duration, animatedValue]);

    const widthInterpolated = animatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp',
    });

    return (
      <View
        ref={ref}
        style={[styles.track, style]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: value }}
        {...props}
      >
        <Animated.View style={[styles.indicator, { width: widthInterpolated }]} />
      </View>
    );
  },
);

Progress.displayName = 'Progress';

const styles = StyleSheet.create({
  track: {
    height: 16,
    width: '100%',
    borderRadius: 9999,
    backgroundColor: 'rgba(63, 63, 70, 0.5)',
    overflow: 'hidden',
  },
  indicator: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: '#6366f1',
  },
});

