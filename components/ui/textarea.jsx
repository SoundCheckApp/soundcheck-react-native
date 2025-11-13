import React, { forwardRef } from 'react';
import { StyleSheet, TextInput } from 'react-native';

export const Textarea = forwardRef(
  (
    {
      style,
      editable = true,
      multiline = true,
      numberOfLines = 4,
      textAlignVertical = 'top',
      placeholderTextColor = '#71717a',
      ...props
    },
    ref,
  ) => (
    <TextInput
      ref={ref}
      style={[styles.textarea, style]}
      editable={editable}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={textAlignVertical}
      placeholderTextColor={placeholderTextColor}
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';

const styles = StyleSheet.create({
  textarea: {
    minHeight: 80,
    width: '100%',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.6)',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#f8fafc',
  },
});

