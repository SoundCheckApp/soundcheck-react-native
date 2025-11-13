import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * AspectRatio component for React Native
 * Ensures children maintain a fixed width:height ratio.
 *
 * @param {Object} props
 * @param {number} props.ratio - Desired aspect ratio (width / height)
 * @param {React.ReactNode} props.children - Content to render inside
 * @param {Object} props.style - Additional style overrides
 */
const AspectRatio = ({ ratio = 1, style, children, ...props }) => {
  return (
    <View
      style={[styles.container, { aspectRatio: ratio }, style]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { AspectRatio };

