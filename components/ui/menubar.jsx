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
  muted: '#9ca3af',
  border: 'rgba(63, 63, 70, 0.6)',
  accent: 'rgba(99, 102, 241, 0.16)',
  accentForeground: '#f9fafb',
};

const MenubarContext = createContext(DEFAULT_THEME);

const Menubar = forwardRef(
  ({ style, children, theme = DEFAULT_THEME, ...props }, ref) => (
    <MenubarContext.Provider value={theme}>
      <View
        ref={ref}
        style={[
          styles.menubar,
          { backgroundColor: theme.background, borderColor: theme.border },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </MenubarContext.Provider>
  ),
);

Menubar.displayName = 'Menubar';

const MenubarMenuContext = createContext(null);

const MenubarMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({
    x: SCREEN.width / 2,
    y: 0,
    width: 0,
    height: 0,
  });

  const value = useMemo(
    () => ({
      open,
      setOpen,
      anchor,
      setAnchor,
    }),
    [open, anchor],
  );

  return (
    <MenubarMenuContext.Provider value={value}>
      {children}
    </MenubarMenuContext.Provider>
  );
};

const useMenubarMenu = () => {
  const context = useContext(MenubarMenuContext);
  if (!context) {
    throw new Error('Menubar components must be used within <MenubarMenu />');
  }
  return context;
};

const MenubarTrigger = forwardRef(
  ({ children, style, onPress, asChild = false, ...props }, ref) => {
    const { setOpen, setAnchor } = useMenubarMenu();
    const theme = useContext(MenubarContext);
    const triggerRef = useRef(null);

    const attachRef = (node) => {
      triggerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      if (React.isValidElement(children) && typeof children.ref === 'function') {
        children.ref(node);
      }
    };

    const handlePress = (event) => {
      onPress?.(event);
      const node = triggerRef.current;
      if (node && typeof node.measureInWindow === 'function') {
        node.measureInWindow((x, y, width, height) => {
          setAnchor({ x, y, width, height });
          setOpen(true);
        });
      } else {
        setOpen(true);
      }
    };

    const childProps = {
      ref: attachRef,
      onPress: handlePress,
      style: [
        styles.trigger,
        { color: theme.foreground },
        style,
      ],
      ...props,
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, childProps);
    }

    return (
      <Pressable {...childProps}>
        {typeof children === 'string' ? (
          <Text style={[styles.triggerText, { color: theme.foreground }]}>
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  },
);

MenubarTrigger.displayName = 'MenubarTrigger';

const MenubarContent = forwardRef(
  (
    {
      children,
      align = 'start',
      alignOffset = 0,
      sideOffset = 8,
      style,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, anchor } = useMenubarMenu();
    const theme = useContext(MenubarContext);
    const [contentSize, setContentSize] = useState({ width: 0, height: 0 });

    const handleClose = useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    const width = contentSize.width || 1;
    let x = anchor.x;
    const y = anchor.y + anchor.height + sideOffset;

    switch (align) {
      case 'center':
        x = anchor.x + anchor.width / 2 - width / 2 + alignOffset;
        break;
      case 'end':
        x = anchor.x + anchor.width - width + alignOffset;
        break;
      case 'start':
      default:
        x = anchor.x + alignOffset;
    }

    const clampedX = Math.max(8, Math.min(x, SCREEN.width - width - 8));

    return (
      <Modal transparent visible={open} animationType="fade" onRequestClose={handleClose}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View
          ref={ref}
          style={[
            styles.content,
            {
              top: y,
              left: clampedX,
              backgroundColor: theme.background,
              borderColor: theme.border,
            },
            style,
          ]}
          onLayout={(event) => {
            const { width: layoutWidth, height } = event.nativeEvent.layout;
            setContentSize({ width: layoutWidth, height });
          }}
          {...props}
        >
          {children}
        </View>
      </Modal>
    );
  },
);

MenubarContent.displayName = 'MenubarContent';

const MenubarGroup = ({ children, style, ...props }) => (
  <View style={style} {...props}>
    {children}
  </View>
);

const MenubarSeparator = forwardRef(({ style, ...props }, ref) => {
  const theme = useContext(MenubarContext);
  return (
    <View
      ref={ref}
      style={[styles.separator, { backgroundColor: theme.border }, style]}
      {...props}
    />
  );
});

MenubarSeparator.displayName = 'MenubarSeparator';

const MenubarItem = forwardRef(
  ({ children, inset = false, disabled = false, onPress, style, ...props }, ref) => {
    const { setOpen } = useMenubarMenu();
    const theme = useContext(MenubarContext);

    const handlePress = () => {
      if (disabled) return;
      onPress?.();
      setOpen(false);
    };

    return (
      <Pressable
        ref={ref}
        disabled={disabled}
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
          <Text style={[styles.itemText, { color: theme.foreground }]}>{children}</Text>
        ) : (
          children
        )}
      </Pressable>
    );
  },
);

MenubarItem.displayName = 'MenubarItem';

const MenubarCheckboxItem = forwardRef(
  ({ children, checked: controlledChecked, defaultChecked = false, onCheckedChange, style, ...props }, ref) => {
    const { setOpen } = useMenubarMenu();
    const theme = useContext(MenubarContext);
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const controlled = controlledChecked !== undefined;
    const checked = controlled ? controlledChecked : internalChecked;

    const toggle = () => {
      const next = !checked;
      if (!controlled) {
        setInternalChecked(next);
      }
      onCheckedChange?.(next);
      setOpen(false);
    };

    return (
      <Pressable
        ref={ref}
        onPress={toggle}
        style={({ pressed }) => [
          styles.item,
          styles.itemCheckbox,
          { backgroundColor: pressed ? theme.accent : 'transparent' },
          style,
        ]}
        {...props}
      >
        <View style={styles.iconBox}>
          {checked ? <Check size={16} color={theme.accentForeground} /> : null}
        </View>
        <Text style={[styles.itemText, { color: theme.foreground }]}>{children}</Text>
      </Pressable>
    );
  },
);

MenubarCheckboxItem.displayName = 'MenubarCheckboxItem';

const MenubarRadioGroupContext = createContext(null);

const MenubarRadioGroup = ({ value, defaultValue, onValueChange, children }) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : internalValue;

  const setValue = useCallback(
    (nextValue) => {
      if (!controlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [controlled, onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      value: currentValue,
      setValue,
    }),
    [currentValue, setValue],
  );

  return (
    <MenubarRadioGroupContext.Provider value={contextValue}>
      <View>{children}</View>
    </MenubarRadioGroupContext.Provider>
  );
};

const useRadioGroup = () => {
  const context = useContext(MenubarRadioGroupContext);
  if (!context) {
    throw new Error('MenubarRadioItem must be used within MenubarRadioGroup');
  }
  return context;
};

const MenubarRadioItem = forwardRef(
  ({ children, value, style, ...props }, ref) => {
    const { value: selectedValue, setValue } = useRadioGroup();
    const { setOpen } = useMenubarMenu();
    const theme = useContext(MenubarContext);
    const checked = selectedValue === value;

    const handlePress = () => {
      setValue(value);
      setOpen(false);
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.item,
          styles.itemCheckbox,
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

MenubarRadioItem.displayName = 'MenubarRadioItem';

const MenubarLabel = forwardRef(({ children, inset = false, style, ...props }, ref) => {
  const theme = useContext(MenubarContext);
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

MenubarLabel.displayName = 'MenubarLabel';

const MenubarShortcut = forwardRef(({ children, style, ...props }, ref) => {
  const theme = useContext(MenubarContext);
  return (
    <Text
      ref={ref}
      style={[styles.shortcut, { color: theme.muted }, style]}
      {...props}
    >
      {children}
    </Text>
  );
});

MenubarShortcut.displayName = 'MenubarShortcut';

const MenubarSubContext = createContext(null);

const MenubarSub = ({ children }) => {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return (
    <MenubarSubContext.Provider value={value}>
      <View>{children}</View>
    </MenubarSubContext.Provider>
  );
};

const useMenubarSub = () => {
  const context = useContext(MenubarSubContext);
  if (!context) {
    throw new Error('MenubarSub components must be used within <MenubarSub />');
  }
  return context;
};

const MenubarSubTrigger = forwardRef(
  ({ children, inset = false, style, ...props }, ref) => {
    const { open, setOpen } = useMenubarSub();
    const theme = useContext(MenubarContext);

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
          style,
        ]}
        {...props}
      >
        <View style={styles.subRow}>
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

MenubarSubTrigger.displayName = 'MenubarSubTrigger';

const MenubarSubContent = forwardRef(({ children, style, ...props }, ref) => {
  const { open } = useMenubarSub();
  const theme = useContext(MenubarContext);

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

MenubarSubContent.displayName = 'MenubarSubContent';

const MenubarPortal = ({ children }) => children;

const styles = StyleSheet.create({
  menubar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    gap: 4,
  },
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
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
    elevation: 10,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
    opacity: 0.6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 2,
    marginVertical: 2,
    gap: 12,
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
  iconBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
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
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  subContent: {
    marginHorizontal: 8,
    marginTop: 4,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
    gap: 4,
  },
});

export {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarLabel,
    MenubarMenu,
    MenubarPortal,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger
};

