import { Check } from 'lucide-react-native';
import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const Checkbox = forwardRef(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      style,
      indicatorStyle,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

    const toggle = () => {
      if (disabled) return;
      const nextValue = !checked;
      if (!isControlled) {
        setInternalChecked(nextValue);
      }
      onCheckedChange?.(nextValue);
    };

    return (
      <Pressable
        ref={ref}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        onPress={toggle}
        disabled={disabled}
        style={({ pressed }) => [
          styles.container,
          checked && styles.containerChecked,
          disabled && styles.containerDisabled,
          pressed && !disabled && styles.containerPressed,
          style,
        ]}
        {...props}
      >
        <View style={[styles.indicator, indicatorStyle]}>
          {checked ? <Check size={14} color="#0f172a" /> : null}
        </View>
      </Pressable>
    );
  },
);

Checkbox.displayName = 'Checkbox';

const styles = StyleSheet.create({
  container: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerChecked: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  containerPressed: {
    borderColor: '#4f46e5',
  },
  indicator: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#0f172a',
  },
});

export { Checkbox };

