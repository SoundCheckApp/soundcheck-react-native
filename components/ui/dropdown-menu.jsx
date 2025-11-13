import { Check, ChevronRight, Circle } from 'lucide-react-native';
import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const SCREEN = Dimensions.get('window');

const DEFAULT_THEME = {
  background: '#18181b',
  foreground: '#f4f4f5',
  muted: '#a1a1aa',
  border: 'rgba(63, 63, 70, 0.6)',
  accent: 'rgba(99, 102, 241, 0.15)',
  accentForeground: '#f9fafb',
};

const DropdownMenuContext = createContext(null);

const useDropdownMenu = () => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(
      'DropdownMenu components must be used within a <DropdownMenu />',
    );
  }
  return context;
};

const DropdownMenu = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  theme = DEFAULT_THEME,
  ...props
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [anchor, setAnchor] = useState({
    x: SCREEN.width / 2 - 100,
    y: SCREEN.height / 2 - 100,
    width: 0,
    height: 0,
  });
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (nextValue) => {
      if (!isControlled) {
        setInternalOpen(nextValue);
      }
      onOpenChange?.(nextValue);
    },
    [isControlled, onOpenChange],
  );

  const value = useMemo(
    () => ({
      open,
      setOpen,
      anchor,
      setAnchor,
      theme,
    }),
    [open, setOpen, anchor, theme],
  );

  return (
    <DropdownMenuContext.Provider value={value} {...props}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

DropdownMenu.displayName = 'DropdownMenu';

const DropdownMenuTrigger = forwardRef(
  ({ children, onPress, asChild = false, ...props }, ref) => {
    const { setOpen, setAnchor } = useDropdownMenu();
    const triggerRef = useRef(null);

    const handlePress = (event) => {
      onPress?.(event);
      const node = triggerRef.current;
      if (node && typeof node.measureInWindow === 'function') {
        node.measureInWindow((x, y, width, height) => {
          setAnchor({ x, y, width, height });
          setOpen(true);
        });
      } else {
        setAnchor((prev) => ({ ...prev }));
        setOpen(true);
      }
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref: (node) => {
          triggerRef.current = node;
          if (typeof children.ref === 'function') {
            children.ref(node);
          } else if (children.ref) {
            children.ref.current = node;
          }
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        },
        onPress: handlePress,
        ...props,
      });
    }

    return (
      <Pressable
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        onPress={handlePress}
        {...props}
      >
        {children}
      </Pressable>
    );
  },
);

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuPortal = ({ children }) => children;

const DropdownMenuContent = forwardRef(
  (
    {
      children,
      style,
      sideOffset = 8,
      align = 'start',
      onRequestClose,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, anchor, theme } = useDropdownMenu();
    const [contentSize, setContentSize] = useState({ width: 0, height: 0 });

    const handleClose = () => {
      setOpen(false);
      onRequestClose?.();
    };

    const horizontalOffset =
      align === 'center'
        ? anchor.x + anchor.width / 2 - contentSize.width / 2
        : align === 'end'
        ? anchor.x + anchor.width - contentSize.width
        : anchor.x;

    const clampedX = Math.max(
      8,
      Math.min(horizontalOffset, SCREEN.width - contentSize.width - 8),
    );

    const clampedY = Math.max(
      8,
      Math.min(anchor.y + anchor.height + sideOffset, SCREEN.height - contentSize.height - 8),
    );

    return (
      <Modal
        transparent
        animationType="fade"
        visible={open}
        onRequestClose={handleClose}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View
          ref={ref}
          style={[
            styles.content,
            {
              top: clampedY,
              left: clampedX,
              backgroundColor: theme.background,
              borderColor: theme.border,
            },
            style,
          ]}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setContentSize({ width, height });
          }}
          {...props}
        >
          {children}
        </View>
      </Modal>
    );
  },
);

DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuGroup = ({ children, style, ...props }) => (
  <View style={style} {...props}>
    {children}
  </View>
);

DropdownMenuGroup.displayName = 'DropdownMenuGroup';

const DropdownMenuSeparator = forwardRef(({ style, ...props }, ref) => {
  const { theme } = useDropdownMenu();
  return (
    <View
      ref={ref}
      style={[styles.separator, { backgroundColor: theme.border }, style]}
      {...props}
    />
  );
});

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

const DropdownMenuItem = forwardRef(
  (
    {
      children,
      inset = false,
      disabled = false,
      onSelect,
      onPress,
      style,
      textStyle,
      ...props
    },
    ref,
  ) => {
    const { setOpen, theme } = useDropdownMenu();

    const handlePress = () => {
      if (disabled) return;
      onSelect?.();
      onPress?.();
      setOpen(false);
    };

    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        accessibilityRole="menuitem"
        onPress={handlePress}
        style={({ pressed }) => [
          styles.item,
          inset && styles.itemInset,
          {
            backgroundColor: pressed ? theme.accent : 'transparent',
          },
          disabled && styles.itemDisabled,
          style,
        ]}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text style={[styles.itemText, { color: theme.foreground }, textStyle]}>
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  },
);

DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuCheckboxItem = forwardRef(
  (
    {
      children,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      style,
      ...props
    },
    ref,
  ) => {
    const { setOpen, theme } = useDropdownMenu();
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

    const toggle = () => {
      const next = !checked;
      if (!isControlled) {
        setInternalChecked(next);
      }
      onCheckedChange?.(next);
      setOpen(false);
    };

    return (
      <Pressable
        ref={ref}
        onPress={toggle}
        accessibilityRole='checkbox'
        accessibilityState={{ checked }}
        style={({ pressed }) => [
          styles.item,
          styles.checkboxItem,
          {
            backgroundColor: pressed ? theme.accent : 'transparent',
          },
          style,
        ]}
        {...props}
      >
        <View style={styles.checkboxIcon}>
          {checked ? <Check size={16} color={theme.accentForeground} /> : null}
        </View>
        <Text style={[styles.itemText, { color: theme.foreground }]}>{children}</Text>
      </Pressable>
    );
  },
);

DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

const DropdownMenuRadioGroupContext = createContext(null);

const DropdownMenuRadioGroup = ({
  value,
  defaultValue,
  onValueChange,
  children,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

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
      value: currentValue,
      setValue,
    }),
    [currentValue, setValue],
  );

  return (
    <DropdownMenuRadioGroupContext.Provider value={contextValue}>
      <View>{children}</View>
    </DropdownMenuRadioGroupContext.Provider>
  );
};

DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';

const useRadioGroupContext = () => {
  const context = useContext(DropdownMenuRadioGroupContext);
  if (!context) {
    throw new Error(
      'DropdownMenuRadioItem must be used within DropdownMenuRadioGroup',
    );
  }
  return context;
};

const DropdownMenuRadioItem = forwardRef(
  ({ children, value, style, ...props }, ref) => {
    const { value: selectedValue, setValue } = useRadioGroupContext();
    const { setOpen, theme } = useDropdownMenu();
    const checked = selectedValue === value;

    const handlePress = () => {
      setValue(value);
      setOpen(false);
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        accessibilityRole='radio'
        accessibilityState={{ checked }}
        style={({ pressed }) => [
          styles.item,
          styles.checkboxItem,
          { backgroundColor: pressed ? theme.accent : 'transparent' },
          style,
        ]}
        {...props}
      >
        <View style={styles.radioIcon}>
          {checked ? (
            <Circle size={10} color={theme.accentForeground} fill={theme.accentForeground} />
          ) : null}
        </View>
        <Text style={[styles.itemText, { color: theme.foreground }]}>{children}</Text>
      </Pressable>
    );
  },
);

DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

const DropdownMenuLabel = forwardRef(({ children, inset = false, style, ...props }, ref) => {
  const { theme } = useDropdownMenu();
  return (
    <Text
      ref={ref}
      style={[
        styles.label,
        inset && styles.labelInset,
        { color: theme.muted },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
});

DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuShortcut = ({ children, style, ...props }) => {
  const { theme } = useDropdownMenu();
  return (
    <Text
      style={[styles.shortcut, { color: theme.muted }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

const DropdownMenuSubContext = createContext(null);

const DropdownMenuSub = ({ children }) => {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({
      open,
      setOpen,
    }),
    [open],
  );

  return (
    <DropdownMenuSubContext.Provider value={value}>
      <View>{children}</View>
    </DropdownMenuSubContext.Provider>
  );
};

DropdownMenuSub.displayName = 'DropdownMenuSub';

const useDropdownMenuSub = () => {
  const context = useContext(DropdownMenuSubContext);
  if (!context) {
    throw new Error(
      'DropdownMenuSub components must be used within <DropdownMenuSub />',
    );
  }
  return context;
};

const DropdownMenuSubTrigger = forwardRef(
  ({ children, inset = false, style, ...props }, ref) => {
    const { open, setOpen } = useDropdownMenuSub();
    const { theme } = useDropdownMenu();

    const handlePress = () => {
      setOpen(!open);
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.item,
          inset && styles.itemInset,
          {
            backgroundColor: pressed || open ? theme.accent : 'transparent',
          },
        ]}
        {...props}
      >
        <View style={styles.subTriggerContent}>
          {typeof children === 'string' ? (
            <Text style={[styles.itemText, { color: theme.foreground }]}>
              {children}
            </Text>
          ) : (
            children
          )}
          <ChevronRight size={16} color={theme.muted} />
        </View>
      </Pressable>
    );
  },
);

DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

const DropdownMenuSubContent = forwardRef(({ children, style, ...props }, ref) => {
  const { open } = useDropdownMenuSub();
  const { theme } = useDropdownMenu();

  if (!open) {
    return null;
  }

  return (
    <View
      ref={ref}
      style={[
        styles.subContent,
        { backgroundColor: theme.background, borderColor: theme.border },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});

DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  content: {
    position: 'absolute',
    minWidth: 192,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
    paddingHorizontal: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
    opacity: 0.5,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  itemInset: {
    paddingLeft: 32,
  },
  itemText: {
    fontSize: 14,
    flex: 1,
  },
  itemDisabled: {
    opacity: 0.4,
  },
  checkboxItem: {
    paddingLeft: 12,
  },
  checkboxIcon: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  labelInset: {
    paddingLeft: 32,
  },
  shortcut: {
    marginLeft: 'auto',
    fontSize: 12,
    letterSpacing: 1,
  },
  subContent: {
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
    gap: 4,
  },
  subTriggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
});

export {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
};

