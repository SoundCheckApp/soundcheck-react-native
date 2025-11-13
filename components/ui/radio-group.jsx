import { Circle } from 'lucide-react-native';
import React, {
    createContext,
    forwardRef,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

const RadioGroupContext = createContext(null);

const useRadioGroup = () => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('RadioGroupItem must be used within RadioGroup');
  }
  return context;
};

export const RadioGroup = forwardRef(
  (
    {
      value,
      defaultValue,
      onValueChange,
      orientation = 'vertical',
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const setValue = (nextValue) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    };

    const contextValue = useMemo(
      () => ({
        value: currentValue,
        setValue,
      }),
      [currentValue],
    );

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <View
          ref={ref}
          style={[
            styles.group,
            orientation === 'horizontal' && styles.horizontal,
            style,
          ]}
          {...props}
        >
          {children}
        </View>
      </RadioGroupContext.Provider>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';

export const RadioGroupItem = forwardRef(
  (
    {
      value,
      disabled = false,
      children,
      style,
      indicatorStyle,
      onPress,
      ...props
    },
    ref,
  ) => {
    const { value: selectedValue, setValue } = useRadioGroup();
    const checked = selectedValue === value;

    const handlePress = () => {
      if (disabled) return;
      setValue(value);
      onPress?.(value);
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="radio"
        accessibilityState={{ checked, disabled }}
        style={[
          styles.item,
          checked && styles.itemChecked,
          disabled && styles.itemDisabled,
          style,
        ]}
        {...props}
      >
        <View style={[styles.indicator, indicatorStyle]}>
          {checked ? <Circle size={14} color="#6366f1" fill="#6366f1" /> : null}
        </View>
        {children}
      </Pressable>
    );
  },
);

RadioGroupItem.displayName = 'RadioGroupItem';

const styles = StyleSheet.create({
  group: {
    flexDirection: 'column',
    gap: 12,
  },
  horizontal: {
    flexDirection: 'row',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  itemChecked: {
    opacity: 1,
  },
  itemDisabled: {
    opacity: 0.4,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

