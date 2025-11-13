import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

const VARIANT_STYLES = {
  default: {
    backgroundColor: '#6366f1',
    textColor: '#ffffff',
    pressedBackground: '#4f46e5',
  },
  destructive: {
    backgroundColor: '#ef4444',
    textColor: '#fef2f2',
    pressedBackground: '#dc2626',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#3f3f46',
    textColor: '#f4f4f5',
    pressedBackground: 'rgba(63,63,70,0.1)',
  },
  secondary: {
    backgroundColor: '#3f3f46',
    textColor: '#e4e4e7',
    pressedBackground: '#27272a',
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: '#c4c4cc',
    pressedBackground: 'rgba(99,102,241,0.1)',
  },
  link: {
    backgroundColor: 'transparent',
    textColor: '#6366f1',
    pressedBackground: 'transparent',
  },
};

const SIZE_STYLES = {
  default: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    textSize: 14,
  },
  sm: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    textSize: 13,
  },
  lg: {
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    textSize: 16,
  },
  icon: {
    minHeight: 40,
    minWidth: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 8,
    textSize: 16,
  },
};

const buttonVariants = ({ variant = 'default', size = 'default' } = {}) => {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.default;

  return {
    container: [
      styles.baseContainer,
      {
        backgroundColor: variantStyle.backgroundColor,
        borderColor: variantStyle.borderColor ?? 'transparent',
        borderRadius: sizeStyle.borderRadius,
        minHeight: sizeStyle.minHeight,
        minWidth: sizeStyle.minWidth,
        paddingHorizontal: sizeStyle.paddingHorizontal,
        paddingVertical: sizeStyle.paddingVertical,
      },
    ],
    text: [
      styles.baseText,
      {
        color: variantStyle.textColor,
        fontSize: sizeStyle.textSize,
      },
    ],
    pressedBackground: variantStyle.pressedBackground ?? variantStyle.backgroundColor,
  };
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'default',
      size = 'default',
      disabled = false,
      asChild = false,
      style,
      textStyle,
      onPress,
      ...props
    },
    ref,
  ) => {
    const computed = buttonVariants({ variant, size });

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onPress,
        disabled,
        style: [computed.container, style, children.props.style],
        children: children.props.children ?? children,
        ref,
        ...props,
      });
    }

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          computed.container,
          style,
          disabled && styles.disabled,
          pressed && !disabled && {
            backgroundColor: computed.pressedBackground,
          },
        ]}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text style={[computed.text, textStyle]}>{children}</Text>
        ) : (
          React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, {
                  style: [computed.text, textStyle, child.props.style],
                })
              : child,
          )
        )}
      </Pressable>
    );
  },
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  baseText: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});

export { Button, buttonVariants };

