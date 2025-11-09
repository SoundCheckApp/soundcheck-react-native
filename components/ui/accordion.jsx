import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Accordion component for React Native
 * A collapsible content component with smooth animations
 */

/**
 * Main Accordion container component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Accordion items
 * @param {string} [props.type="single"] - Type of accordion ("single" or "multiple")
 * @param {boolean} [props.collapsible=true] - Whether accordion can be collapsed
 * @param {string} [props.value] - Controlled value for single accordion
 * @param {string[]} [props.defaultValue] - Default value for single accordion
 * @param {Function} [props.onValueChange] - Callback when value changes
 * @param {string} [props.className] - Additional styles
 */
const Accordion = ({ 
  children, 
  type = "single", 
  collapsible = true, 
  value, 
  defaultValue, 
  onValueChange,
  className 
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || (type === "single" ? "" : []));
  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <View style={[styles.accordion, className]}>
      {React.Children.map(children, (child) => 
        React.cloneElement(child, { 
          type, 
          collapsible, 
          value: currentValue, 
          onValueChange: handleValueChange 
        })
      )}
    </View>
  );
};

/**
 * Individual accordion item component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Accordion trigger and content
 * @param {string} props.value - Unique value for this item
 * @param {string} [props.className] - Additional styles
 */
const AccordionItem = ({ children, value, className }) => {
  return (
    <View style={[styles.accordionItem, className]}>
      {React.Children.map(children, (child) => 
        React.cloneElement(child, { itemValue: value })
      )}
    </View>
  );
};

/**
 * Accordion trigger component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to display in trigger
 * @param {string} [props.className] - Additional styles
 */
const AccordionTrigger = ({ children, className, itemValue, type, collapsible, value, onValueChange }) => {
  const isOpen = type === "single" ? value === itemValue : value?.includes(itemValue);
  const [rotation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(rotation, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotation]);

  const handlePress = () => {
    if (type === "single") {
      const newValue = isOpen && collapsible ? "" : itemValue;
      onValueChange?.(newValue);
    } else {
      const currentValues = value || [];
      const newValues = isOpen 
        ? currentValues.filter(v => v !== itemValue)
        : [...currentValues, itemValue];
      onValueChange?.(newValues);
    }
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity 
      style={[styles.accordionTrigger, className]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.triggerText}>{children}</Text>
      <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
        <ChevronDown size={16} color="#a1a1aa" />
      </Animated.View>
    </TouchableOpacity>
  );
};

/**
 * Accordion content component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to display when expanded
 * @param {string} [props.className] - Additional styles
 */
const AccordionContent = ({ children, className, itemValue, type, value }) => {
  const isOpen = type === "single" ? value === itemValue : value?.includes(itemValue);
  const [height] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(height, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(height, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, height, opacity]);

  if (!isOpen) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.accordionContent,
        {
          opacity,
          maxHeight: height.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1000], // Adjust based on content
          }),
        },
        className
      ]}
    >
      <View style={styles.contentInner}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  accordion: {
    width: '100%',
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
  },
  accordionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  accordionContent: {
    overflow: 'hidden',
  },
  contentInner: {
    paddingBottom: 16,
    paddingTop: 0,
  },
});

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };

