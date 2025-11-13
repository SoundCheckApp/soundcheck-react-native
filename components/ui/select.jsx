import React, {
    createContext,
    forwardRef,
    useMemo,
    useState,
} from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';

import { Button } from '@/components/ui/button';

const SelectContext = createContext(null);

const useSelect = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within <Select />');
  }
  return context;
};

export const Select = ({
  value,
  defaultValue,
  onValueChange,
  children,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [triggerLayout, setTriggerLayout] = useState(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const selectedValue = value !== undefined ? value : internalValue;

  const setOpen = (nextOpen) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const setValue = (nextValue) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      value: selectedValue,
      setValue,
      triggerLayout,
      setTriggerLayout,
    }),
    [open, selectedValue, triggerLayout],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      {children}
    </SelectContext.Provider>
  );
};

Select.displayName = 'Select';

export const SelectGroup = ({ children }) => <View>{children}</View>;

export const SelectValue = ({ placeholder, children, style }) => {
  const { value } = useSelect();
  if (children) return children;
  return (
    <Text numberOfLines={1} style={[styles.valueText, style]}>
      {value ?? placeholder ?? 'Select an option'}
    </Text>
  );
};

SelectValue.displayName = 'SelectValue';

export const SelectTrigger = forwardRef(
  ({ children, style, disabled = false, ...props }, ref) => {
    const { open, setOpen, setTriggerLayout } = useSelect();
    return (
      <Button
        ref={ref}
        variant="outline"
        size="default"
        disabled={disabled}
        onPress={() => setOpen(!open)}
        style={[styles.trigger, style]}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          const { pageX, pageY } = event.nativeEvent;
          setTriggerLayout({
            x: pageX,
            y: pageY,
            width: layout.width,
            height: layout.height,
          });
        }}
        {...props}
      >
        <View style={styles.triggerContent}>{children}</View>
        <ChevronDown size={16} color="#a1a1aa" />
      </Button>
    );
  },
);

SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = ({
  children,
  style,
  align = 'center',
  side = 'bottom',
  sideOffset = 8,
  ...props
}) => {
  const { open, setOpen, triggerLayout } = useSelect();

  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
      <View
        style={[
          styles.content,
          triggerLayout && computePosition(triggerLayout, align, side, sideOffset),
          style,
        ]}
        {...props}
      >
        <ScrollButtons direction="up" />
        <View style={styles.viewport}>{children}</View>
        <ScrollButtons direction="down" />
      </View>
    </Modal>
  );
};

SelectContent.displayName = 'SelectContent';

const ScrollButtons = ({ direction }) => (
  <View style={styles.scrollButton}>
    {direction === 'up' ? (
      <ChevronUp size={16} color="#a1a1aa" />
    ) : (
      <ChevronDown size={16} color="#a1a1aa" />
    )}
  </View>
);

export const SelectLabel = ({ style, children }) => (
  <Text style={[styles.label, style]}>{children}</Text>
);

SelectLabel.displayName = 'SelectLabel';

export const SelectItem = ({
  value,
  disabled = false,
  children,
  style,
  ...props
}) => {
  const { value: selectedValue, setValue, setOpen } = useSelect();
  const isSelected = selectedValue === value;

  const handleSelect = () => {
    if (disabled) return;
    setValue(value);
    setOpen(false);
  };

  return (
    <TouchableOpacity
      style={[
        styles.item,
        isSelected && styles.itemSelected,
        disabled && styles.itemDisabled,
        style,
      ]}
      onPress={handleSelect}
      disabled={disabled}
      {...props}
    >
      <View style={styles.itemIndicator}>
        {isSelected ? <Check size={16} color="#f4f4f5" /> : null}
      </View>
      <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

SelectItem.displayName = 'SelectItem';

export const SelectSeparator = ({ style }) => (
  <View style={[styles.separator, style]} />
);

SelectSeparator.displayName = 'SelectSeparator';

const computePosition = (layout, align, side, offset) => {
  const position = {};

  if (side === 'top') {
    position.bottom = layout.y + layout.height + offset;
  } else {
    position.top = layout.y + layout.height + offset;
  }

  if (align === 'start') {
    position.left = layout.x;
  } else if (align === 'end') {
    position.right = Dimensions.get('window').width - (layout.x + layout.width);
  } else {
    const screenWidth = Dimensions.get('window').width;
    const center = layout.x + layout.width / 2;
    const left = Math.max(12, center - layout.width / 2);
    const right = Math.min(screenWidth - 12, center + layout.width / 2);
    position.left = left;
    position.right = screenWidth - right;
  }

  return position;
};

const styles = StyleSheet.create({
  trigger: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  triggerContent: {
    flex: 1,
    display: 'flex',
  },
  content: {
    position: 'absolute',
    minWidth: 180,
    maxHeight: 320,
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
  },
  viewport: {
    paddingVertical: 4,
  },
  scrollButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a1a1aa',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  itemSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  itemDisabled: {
    opacity: 0.4,
  },
  itemIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(63,63,70,0.7)',
  },
  itemText: {
    color: '#e2e8f0',
    fontSize: 14,
    flex: 1,
  },
  itemTextSelected: {
    color: '#f4f4f5',
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
    backgroundColor: 'rgba(63,63,70,0.6)',
  },
  valueText: {
    color: '#f8fafc',
    fontSize: 14,
  },
});

