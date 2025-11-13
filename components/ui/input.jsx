import React, { forwardRef } from 'react';
import { StyleSheet, TextInput } from 'react-native';

const Input = forwardRef(
  (
    {
      style,
      editable = true,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    return (
      <TextInput
        ref={ref}
        editable={editable}
        style={[styles.input, !editable && styles.disabled, style]}
        placeholderTextColor="#71717a"
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: '100%',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(113, 113, 122, 0.6)',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#f8fafc',
  },
  disabled: {
    opacity: 0.5,
  },
});

export { Input };

