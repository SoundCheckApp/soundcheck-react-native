import React, { forwardRef } from 'react';
import { Switch as RNSwitch, StyleSheet } from 'react-native';

export const Switch = forwardRef(
  (
    {
      value,
      onValueChange,
      disabled = false,
      style,
      thumbColor,
      trackColor = {
        false: 'rgba(63,63,70,0.6)',
        true: '#6366f1',
      },
      ...props
    },
    ref,
  ) => (
    <RNSwitch
      ref={ref}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      thumbColor={thumbColor ?? (value ? '#f8fafc' : '#e2e8f0')}
      trackColor={trackColor}
      style={[styles.switch, style]}
      ios_backgroundColor="rgba(63,63,70,0.4)"
      {...props}
    />
  ),
);

Switch.displayName = 'Switch';

const styles = StyleSheet.create({
  switch: {
    transform: [{ scale: 0.95 }],
  },
});

