import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

export const Separator = forwardRef(
  (
    {
      orientation = 'horizontal',
      decorative = true,
      style,
      ...props
    },
    ref,
  ) => (
    <View
      ref={ref}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'auto'}
      style={[
        styles.base,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        style,
      ]}
      {...props}
    />
  ),
);

Separator.displayName = 'Separator';

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(63,63,70,0.6)',
  },
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    height: '100%',
  },
});

