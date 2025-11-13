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
  border: 'rgba(63, 63, 70, 0.7)',
  accent: 'rgba(99, 102, 241, 0.18)',
  accentForeground: '#f9fafb',
};

const ContextMenuContext = createContext(null);

const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error(
      'ContextMenu components must be used within a <ContextMenu />',
    );
  }
  return context;
};

const ContextMenu = forwardRef(
  (
    {
      children,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      theme = DEFAULT_THEME,
      style,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const [position, setPosition] = useState({ x: SCREEN.width / 2, y: SCREEN.height / 2 });
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    const setOpen = useCallback(
      (nextOpen, nextPosition) => {
        if (disabled) return;
        if (nextPosition) {
          setPosition(nextPosition);
        }

        if (!isControlled) {
          setInternalOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
      },
      [disabled, isControlled, onOpenChange],
    );

    const value = useMemo(
      () => ({
        open,
        disabled,
        setOpen,
        position,
        theme,
      }),
      [open, disabled, setOpen, position, theme],
    );

    return (
      <ContextMenuContext.Provider value={value}>
        <View ref={ref} style={style} {...props}>
          {children}
        </View>
      </ContextMenuContext.Provider>
    );
  },
);

ContextMenu.displayName = 'ContextMenu';

const ContextMenuTrigger = forwardRef(
  ({ children, onLongPress, onPress, style, delayLongPress = 200, ...props }, ref) => {
    const { setOpen, disabled } = useContextMenu();

    const handleLongPress = (event) => {
      onLongPress?.(event);
      const { pageX, pageY } = event.nativeEvent;
      setOpen(true, { x: pageX, y: pageY });
    };

    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        onLongPress={handleLongPress}
        onPress={onPress}
        delayLongPress={delayLongPress}
        style={style}
        {...props}
      >
        {children}
      </Pressable>
    );
  },
);

ContextMenuTrigger.displayName = 'ContextMenuTrigger';

const clampPosition = ({ x, y }, width = 192, height = 200) => {
  const padding = 8;
  const clampedX = Math.min(
    Math.max(padding, x),
    SCREEN.width - width - padding,
  );
  const clampedY = Math.min(
    Math.max(padding, y),
    SCREEN.height - height - padding,
  );
  return { x: clampedX, y: clampedY };
};

const ContextMenuPortal = ({ children }) => children;

const ContextMenuContent = forwardRef(
  ({ children, style, maxWidth = 240, ...props }, ref) => {
    const { open, setOpen, position, theme } = useContextMenu();
    const contentRef = useRef(null);
    const [contentSize, setContentSize] = useState({ width: maxWidth, height: 0 });

    const handleClose = () => setOpen(false);

    const measuredPosition = clampPosition(position, contentSize.width, contentSize.height || 200);

    return (
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.overlay} />
        </Pressable>
        <View
          ref={contentRef}
          style={[
            styles.content,
            {
              top: measuredPosition.y,
              left: measuredPosition.x,
              maxWidth,
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

ContextMenuContent.displayName = 'ContextMenuContent';

const ContextMenuGroup = ({ children, style, ...props }) => (
  <View style={style} {...props}>
    {children}
  </View>
);

ContextMenuGroup.displayName = 'ContextMenuGroup';

const ContextMenuSeparator = forwardRef(({ style, ...props }, ref) => {
  const { theme } = useContextMenu();
  return (
    <View
      ref={ref}
      style={[styles.separator, { backgroundColor: theme.border }, style]}
      {...props}
    />
  );
});

ContextMenuSeparator.displayName = 'ContextMenuSeparator';

const ContextMenuItem = forwardRef(
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
    const { setOpen, theme } = useContextMenu();

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

ContextMenuItem.displayName = 'ContextMenuItem';

const ContextMenuCheckboxItem = forwardRef(
  ({ children, checked: controlledChecked, defaultChecked = false, onCheckedChange, ...props }, ref) => {
    const { theme, setOpen } = useContextMenu();
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
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={toggle}
        style={({ pressed }) => [
          styles.item,
          styles.itemCheckbox,
          { backgroundColor: pressed ? theme.accent : 'transparent' },
        ]}
        {...props}
      >
        <View style={styles.checkboxContainer}>
          {checked ? <Check size={16} color={theme.accentForeground} /> : null}
        </View>
        <Text style={[styles.itemText, { color: theme.foreground }]}>{children}</Text>
      </Pressable>
    );
  },
);

ContextMenuCheckboxItem.displayName = 'ContextMenuCheckboxItem';

const ContextMenuRadioGroupContext = createContext(null);

const ContextMenuRadioGroup = ({ value, defaultValue, onValueChange, children }) => {
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
    <ContextMenuRadioGroupContext.Provider value={contextValue}>
      <View>{children}</View>
    </ContextMenuRadioGroupContext.Provider>
  );
};

ContextMenuRadioGroup.displayName = 'ContextMenuRadioGroup';

const useRadioGroup = () => {
  const context = useContext(ContextMenuRadioGroupContext);
  if (!context) {
    throw new Error(
      'ContextMenuRadioItem must be used within a ContextMenuRadioGroup',
    );
  }
  return context;
};

const ContextMenuRadioItem = forwardRef(
  ({ children, value, ...props }, ref) => {
    const { value: selectedValue, setValue } = useRadioGroup();
    const { theme, setOpen } = useContextMenu();
    const checked = selectedValue === value;

    const handlePress = () => {
      setValue(value);
      setOpen(false);
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        accessibilityRole="radio"
        accessibilityState={{ checked }}
        style={({ pressed }) => [
          styles.item,
          styles.itemCheckbox,
          { backgroundColor: pressed ? theme.accent : 'transparent' },
        ]}
        {...props}
      >
        <View style={styles.radioContainer}>
          {checked ? <Circle size={10} color={theme.accentForeground} fill={theme.accentForeground} /> : null}
        </View>
        <Text style={[styles.itemText, { color: theme.foreground }]}>{children}</Text>
      </Pressable>
    );
  },
);

ContextMenuRadioItem.displayName = 'ContextMenuRadioItem';

const ContextMenuLabel = forwardRef(
  ({ children, inset = false, style, ...props }, ref) => {
    const { theme } = useContextMenu();
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
  },
);

ContextMenuLabel.displayName = 'ContextMenuLabel';

const ContextMenuShortcut = ({ children, style, ...props }) => {
  const { theme } = useContextMenu();
  return (
    <Text
      style={[styles.shortcut, { color: theme.muted }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

ContextMenuShortcut.displayName = 'ContextMenuShortcut';

const ContextMenuSubContext = createContext(null);

const ContextMenuSub = ({ children }) => {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({
      open,
      setOpen,
    }),
    [open],
  );

  return (
    <ContextMenuSubContext.Provider value={value}>
      <View>{children}</View>
    </ContextMenuSubContext.Provider>
  );
};

ContextMenuSub.displayName = 'ContextMenuSub';

const useContextMenuSub = () => {
  const context = useContext(ContextMenuSubContext);
  if (!context) {
    throw new Error(
      'ContextMenuSub components must be used within <ContextMenuSub />',
    );
  }
  return context;
};

const ContextMenuSubTrigger = forwardRef(
  ({ children, inset = false, style, ...props }, ref) => {
    const { open, setOpen } = useContextMenuSub();
    const { theme } = useContextMenu();

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

ContextMenuSubTrigger.displayName = 'ContextMenuSubTrigger';

const ContextMenuSubContent = forwardRef(({ children, style, ...props }, ref) => {
  const { open } = useContextMenuSub();
  const { theme } = useContextMenu();

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

ContextMenuSubContent.displayName = 'ContextMenuSubContent';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 192,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
    opacity: 0.6,
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 4,
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
  itemCheckbox: {
    paddingLeft: 12,
  },
  checkboxContainer: {
    width: 18,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
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
    marginHorizontal: 12,
    marginTop: 4,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
  },
  subTriggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
});

export {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuPortal,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger
};

