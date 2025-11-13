import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const VARIANT_STYLES = {
  default: {
    container: {
      backgroundColor: '#111827',
      borderColor: '#1f2937',
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
    },
    text: {
      color: '#f9fafb',
    },
  },
  destructive: {
    container: {
      backgroundColor: '#7f1d1d',
      borderColor: 'rgba(239, 68, 68, 0.5)',
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
    },
    text: {
      color: '#fecaca',
    },
  },
};

const Alert = forwardRef(({ children, variant = 'default', style, ...props }, ref) => {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

  return (
    <View
      ref={ref}
      accessibilityRole="alert"
      style={[variantStyle.container, style]}
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              style: [variantStyle.text, child.props.style],
            })
          : child
      )}
    </View>
  );
});

Alert.displayName = 'Alert';

const AlertTitle = forwardRef(({ children, style, ...props }, ref) => (
  <Text ref={ref} style={[styles.title, style]} {...props}>
    {children}
  </Text>
));

AlertTitle.displayName = 'AlertTitle';

const AlertDescription = forwardRef(({ children, style, ...props }, ref) => (
  <Text ref={ref} style={[styles.description, style]} {...props}>
    {children}
  </Text>
));

AlertDescription.displayName = 'AlertDescription';

const styles = StyleSheet.create({
  title: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export { Alert, AlertDescription, AlertTitle };

