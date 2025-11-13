import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Card = forwardRef(({ children, style, ...props }, ref) => (
  <View ref={ref} style={[styles.card, style]} {...props}>
    {children}
  </View>
));

Card.displayName = 'Card';

const CardHeader = forwardRef(({ children, style, ...props }, ref) => (
  <View ref={ref} style={[styles.header, style]} {...props}>
    {children}
  </View>
));

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef(({ children, style, ...props }, ref) => (
  <Text ref={ref} style={[styles.title, style]} {...props}>
    {children}
  </Text>
));

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef(({ children, style, ...props }, ref) => (
  <Text ref={ref} style={[styles.description, style]} {...props}>
    {children}
  </Text>
));

CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef(({ children, style, ...props }, ref) => (
  <View ref={ref} style={[styles.content, style]} {...props}>
    {children}
  </View>
));

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef(({ children, style, ...props }, ref) => (
  <View ref={ref} style={[styles.footer, style]} {...props}>
    {children}
  </View>
));

CardFooter.displayName = 'CardFooter';

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#18181b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 0,
    gap: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

