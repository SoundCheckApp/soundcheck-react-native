import React from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

export const Skeleton = ({ style, ...props }) => {
  const animation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animation]);

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(63, 63, 70, 0.4)', 'rgba(99, 102, 241, 0.3)'],
  });

  return (
    <Animated.View
      style={[styles.skeleton, { backgroundColor }, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 8,
  },
});

