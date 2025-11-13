import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { toggleVariants } from '@/components/ui/toggle';

const ToggleGroupContext = createContext({
  value: undefined,
  onValueChange: () => {},
  variant: 'default',
  size: 'default',
  type: 'single',
});

export const ToggleGroup = forwardRef(
  (
    {
      value,
      defaultValue,
      onValueChange,
      children,
      variant = 'default',
      size = 'default',
      type = 'single',
      style,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(
      type === 'multiple'
        ? defaultValue ?? []
        : defaultValue ?? null,
    );
    const isControlled = value !== undefined;
    const selected = isControlled ? value : internalValue;

    const setValue = useCallback(
      (nextValue) => {
        if (!isControlled) {
          setInternalValue(nextValue);
        }
        onValueChange?.(nextValue);
      },
      [isControlled, onValueChange],
    );

    const contextValue = useMemo(
      () => ({
        value: selected,
        onValueChange: setValue,
        variant,
        size,
        type,
      }),
      [selected, setValue, variant, size, type],
    );

    return (
      <ToggleGroupContext.Provider value={contextValue}>
        <View
          ref={ref}
          style={[styles.group, style]}
          {...props}
        >
          {children}
        </View>
      </ToggleGroupContext.Provider>
    );
  },
);

ToggleGroup.displayName = 'ToggleGroup';

export const ToggleGroupItem = forwardRef(
  ({ value, children, style, textStyle, ...props }, ref) => {
    const { value: selected, onValueChange, variant, size, type } = useContext(ToggleGroupContext);

    const isSelected = type === 'multiple'
      ? Array.isArray(selected) && selected.includes(value)
      : selected === value;

    const handlePress = () => {
      if (type === 'multiple') {
        const nextValue = isSelected
          ? selected.filter((item) => item !== value)
          : [...(selected ?? []), value];
        onValueChange(nextValue);
      } else {
        onValueChange(isSelected ? null : value);
      }
    };

    const stylesOverride = StyleSheet.flatten([
      toggleVariants({ variant, size, pressed: isSelected }),
      style,
    ]);

    return (
      <TouchableOpacity
        ref={ref}
        onPress={handlePress}
        style={stylesOverride}
        {...props}
      >
        {typeof children === 'string'
          ? (
            <Text
              style={[
                styles.itemText,
                isSelected && styles.itemTextSelected,
                textStyle,
              ]}
            >
              {children}
            </Text>
          )
          : children}
      </TouchableOpacity>
    );
  },
);

ToggleGroupItem.displayName = 'ToggleGroupItem';

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemText: {
    color: '#f4f4f5',
    fontSize: 14,
  },
  itemTextSelected: {
    color: '#f8fafc',
    fontWeight: '600',
  },
});

