import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const VARIANT_STYLES = {
  default: {
    container: {
      backgroundColor: '#6366f1',
      borderColor: 'transparent',
    },
    text: {
      color: '#ffffff',
    },
  },
  secondary: {
    container: {
      backgroundColor: '#3f3f46',
      borderColor: 'transparent',
    },
    text: {
      color: '#e4e4e7',
    },
  },
  destructive: {
    container: {
      backgroundColor: '#ef4444',
      borderColor: 'transparent',
    },
    text: {
      color: '#fef2f2',
    },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderColor: '#3f3f46',
    },
    text: {
      color: '#f4f4f5',
    },
  },
};

const badgeVariants = ({ variant = 'default' } = {}) => {
  const selected = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  return {
    container: [styles.baseContainer, selected.container],
    text: [styles.baseText, selected.text],
  };
};

const Badge = ({
  children,
  variant = 'default',
  containerStyle,
  textStyle,
  ...props
}) => {
  const computedStyles = badgeVariants({ variant });

  return (
    <View style={[computedStyles.container, containerStyle]} {...props}>
      {typeof children === 'string' ? (
        <Text style={[computedStyles.text, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  baseText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export { Badge, badgeVariants };

