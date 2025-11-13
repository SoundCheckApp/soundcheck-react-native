import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export const toggleVariants = ({
  variant = 'default',
  size = 'default',
  pressed = false,
  disabled = false,
} = {}) => {
  const baseStyles = [
    styles.base,
    sizeStyles[size] ?? sizeStyles.default,
    variantStyles[variant]?.base ?? {},
    pressed && (variantStyles[variant]?.pressed ?? styles.pressed),
    disabled && styles.disabled,
  ];
  return StyleSheet.flatten(baseStyles);
};

export const Toggle = forwardRef(
  (
    {
      pressed,
      defaultPressed = false,
      onPressedChange,
      disabled = false,
      variant = 'default',
      size = 'default',
      style,
      textStyle,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalPressed, setInternalPressed] = useState(defaultPressed);
    const isControlled = pressed !== undefined;
    const isPressed = isControlled ? pressed : internalPressed;

    useImperativeHandle(ref, () => ({
      setPressed: (next) => {
        if (!isControlled) {
          setInternalPressed(next);
        }
        onPressedChange?.(next);
      },
    }), [isControlled, onPressedChange]);

    useEffect(() => {
      if (isControlled) {
        setInternalPressed(pressed ?? false);
      }
    }, [pressed, isControlled]);

    const handlePress = () => {
      if (disabled) return;
      const next = !isPressed;
      if (!isControlled) {
        setInternalPressed(next);
      }
      onPressedChange?.(next);
    };

    const containerStyle = [
      toggleVariants({ variant, size, pressed: isPressed, disabled }),
      style,
    ];

    const content =
      typeof children === 'string' ? (
        <Text
          style={[
            styles.text,
            isPressed ? styles.textPressed : styles.textDefault,
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      );

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityState={{ disabled, pressed: isPressed }}
        disabled={disabled}
        onPress={handlePress}
        style={containerStyle}
        {...props}
      >
        {content}
      </TouchableOpacity>
    );
  },
);

Toggle.displayName = 'Toggle';

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  pressed: {
    backgroundColor: 'rgba(99,102,241,0.18)',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  textDefault: {
    color: '#e4e4e7',
  },
  textPressed: {
    color: '#f4f4f5',
  },
});

const sizeStyles = StyleSheet.create({
  default: {
    height: 40,
    paddingHorizontal: 12,
  },
  sm: {
    height: 36,
    paddingHorizontal: 10,
  },
  lg: {
    height: 44,
    paddingHorizontal: 16,
  },
});

const variantStyles = {
  default: {
    base: {},
    pressed: {
      backgroundColor: 'rgba(99,102,241,0.18)',
    },
  },
  outline: {
    base: {
      backgroundColor: 'transparent',
      borderColor: 'rgba(63,63,70,0.6)',
    },
    pressed: {
      backgroundColor: 'rgba(99,102,241,0.18)',
      borderColor: 'rgba(99,102,241,0.5)',
    },
  },
  primary: {
    base: {
      backgroundColor: 'rgba(99,102,241,0.18)',
      borderColor: 'rgba(99,102,241,0.5)',
    },
  },
};

