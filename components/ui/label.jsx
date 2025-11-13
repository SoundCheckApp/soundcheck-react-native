import React, { forwardRef } from 'react';
import { StyleSheet, Text } from 'react-native';

const Label = forwardRef(
  (
    {
      style,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    return (
      <Text
        ref={ref}
        style={[
          styles.label,
          disabled && styles.disabled,
          style,
        ]}
        accessibilityState={{ disabled }}
        {...props}
      />
    );
  },
);

Label.displayName = 'Label';

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e4e4e7',
  },
  disabled: {
    opacity: 0.7,
  },
});

export { Label };

