import React, { createContext, forwardRef, useContext, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TabsContext = createContext(null);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within <Tabs />');
  }
  return context;
};

export const Tabs = ({
  value,
  defaultValue,
  onValueChange,
  children,
  orientation = 'horizontal',
  style,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(
    value ?? defaultValue ?? null,
  );
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const setValue = (nextValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  const contextValue = useMemo(
    () => ({
      value: selectedValue,
      setValue,
      orientation,
    }),
    [selectedValue, orientation],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <View style={[styles.tabsContainer, style]} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  );
};

Tabs.displayName = 'Tabs';

export const TabsList = forwardRef(({ children, style, ...props }, ref) => {
  const { orientation } = useTabs();
  return (
    <View
      ref={ref}
      style={[
        styles.list,
        orientation === 'vertical' && styles.listVertical,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});

TabsList.displayName = 'TabsList';

export const TabsTrigger = forwardRef(
  ({ value, disabled = false, style, textStyle, children, ...props }, ref) => {
    const { value: selectedValue, setValue } = useTabs();
    const isActive = selectedValue === value;

    return (
      <TouchableOpacity
        ref={ref}
        disabled={disabled}
        onPress={() => setValue(value)}
        style={[
          styles.trigger,
          isActive && styles.triggerActive,
          disabled && styles.triggerDisabled,
          style,
        ]}
        {...props}
      >
        <Text
          style={[
            styles.triggerText,
            isActive && styles.triggerTextActive,
            disabled && styles.triggerTextDisabled,
            textStyle,
          ]}
        >
          {children}
        </Text>
      </TouchableOpacity>
    );
  },
);

TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = forwardRef(
  ({ value, children, style, ...props }, ref) => {
    const { value: selectedValue } = useTabs();
    if (selectedValue !== value) {
      return null;
    }
    return (
      <View ref={ref} style={[styles.content, style]} {...props}>
        {children}
      </View>
    );
  },
);

TabsContent.displayName = 'TabsContent';

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 4,
    backgroundColor: 'rgba(63,63,70,0.3)',
    marginBottom: 8,
  },
  listVertical: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },
  trigger: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  triggerActive: {
    backgroundColor: 'rgba(99,102,241,0.16)',
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  triggerTextActive: {
    color: '#f4f4f5',
    fontWeight: '600',
  },
  triggerTextDisabled: {
    color: '#71717a',
  },
  content: {
    paddingTop: 8,
  },
});

