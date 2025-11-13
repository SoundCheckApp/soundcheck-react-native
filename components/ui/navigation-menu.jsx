import { ChevronDown } from 'lucide-react-native';
import React, {
    createContext,
    forwardRef,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const DEFAULT_THEME = {
  background: '#18181b',
  foreground: '#f4f4f5',
  accent: 'rgba(99,102,241,0.18)',
  accentForeground: '#f9fafb',
  border: 'rgba(63,63,70,0.6)',
  muted: '#a1a1aa',
};

const NavigationMenuContext = createContext(DEFAULT_THEME);
const NavigationMenuItemContext = createContext(null);
const NavigationMenuSubContext = createContext(null);

export const navigationMenuTriggerStyle = (isOpen = false, disabled = false) => [
  styles.trigger,
  isOpen && styles.triggerOpen,
  disabled && styles.triggerDisabled,
];

export const NavigationMenu = forwardRef(
  ({ children, style, theme = DEFAULT_THEME, ...props }, ref) => (
    <NavigationMenuContext.Provider value={theme}>
      <View
        ref={ref}
        style={[
          styles.menu,
          { backgroundColor: theme.background, borderColor: theme.border },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </NavigationMenuContext.Provider>
  ),
);

NavigationMenu.displayName = 'NavigationMenu';

export const NavigationMenuList = forwardRef(
  ({ children, style, ...props }, ref) => (
    <View ref={ref} style={[styles.list, style]} {...props}>
      {children}
    </View>
  ),
);

NavigationMenuList.displayName = 'NavigationMenuList';

export const NavigationMenuItem = ({ children }) => {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return (
    <NavigationMenuItemContext.Provider value={value}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </NavigationMenuItemContext.Provider>
  );
};

export const NavigationMenuTrigger = forwardRef(
  ({ children, style, disabled = false, ...props }, ref) => {
    const theme = useContext(NavigationMenuContext);
    const item = useContext(NavigationMenuItemContext);
    if (!item) {
      throw new Error('NavigationMenuTrigger must be used within NavigationMenuItem');
    }

    return (
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          ref={ref}
          variant="ghost"
          disabled={disabled}
          style={[
            navigationMenuTriggerStyle(item.open, disabled),
            { color: theme.foreground },
            style,
          ]}
          {...props}
        >
          <Text style={[styles.triggerText, { color: theme.foreground }]}>
            {children}
          </Text>
          <ChevronDown
            size={14}
            color={theme.muted}
            style={[styles.triggerIcon, item.open && styles.triggerIconOpen]}
          />
        </Button>
      </PopoverTrigger>
    );
  },
);

NavigationMenuTrigger.displayName = 'NavigationMenuTrigger';

export const NavigationMenuContent = forwardRef(
  ({ children, style, ...props }, ref) => {
    const theme = useContext(NavigationMenuContext);
    return (
      <PopoverContent
        ref={ref}
        align="start"
        style={[
          styles.content,
          { backgroundColor: theme.background, borderColor: theme.border },
          style,
        ]}
        {...props}
      >
        {children}
      </PopoverContent>
    );
  },
);

NavigationMenuContent.displayName = 'NavigationMenuContent';

export const NavigationMenuLink = forwardRef(
  ({ children, style, onPress, ...props }, ref) => {
    const theme = useContext(NavigationMenuContext);
    return (
      <TouchableOpacity
        ref={ref}
        onPress={onPress}
        style={[styles.link, style]}
        {...props}
      >
        <Text style={[styles.linkText, { color: theme.foreground }]}>
          {children}
        </Text>
      </TouchableOpacity>
    );
  },
);

NavigationMenuLink.displayName = 'NavigationMenuLink';

export const NavigationMenuViewport = forwardRef(
  ({ style, children, ...props }, ref) => (
    <View ref={ref} style={[styles.viewport, style]} {...props}>
      {children}
    </View>
  ),
);

NavigationMenuViewport.displayName = 'NavigationMenuViewport';

export const NavigationMenuIndicator = forwardRef(
  ({ style, ...props }, ref) => {
    const theme = useContext(NavigationMenuContext);
    return (
      <View
        ref={ref}
        style={[
          styles.indicator,
          { backgroundColor: theme.accent },
          style,
        ]}
        {...props}
      />
    );
  },
);

NavigationMenuIndicator.displayName = 'NavigationMenuIndicator';

export const NavigationMenuGroup = ({ children, style, ...props }) => (
  <View style={style} {...props}>
    {children}
  </View>
);

export const NavigationMenuPortal = ({ children }) => children;

export const NavigationMenuSub = ({ children }) => {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return (
    <NavigationMenuSubContext.Provider value={value}>
      {children}
    </NavigationMenuSubContext.Provider>
  );
};

export const NavigationMenuSubTrigger = forwardRef(
  ({ children, style, ...props }, ref) => {
    const theme = useContext(NavigationMenuContext);
    const sub = useContext(NavigationMenuSubContext);
    if (!sub) {
      throw new Error('NavigationMenuSubTrigger must be used within NavigationMenuSub');
    }

    return (
      <TouchableOpacity
        ref={ref}
        onPress={() => sub.setOpen(!sub.open)}
        style={[
          styles.subTrigger,
          { backgroundColor: sub.open ? theme.accent : 'transparent' },
          style,
        ]}
        {...props}
      >
        <Text style={[styles.subTriggerText, { color: theme.foreground }]}>
          {children}
        </Text>
        <ChevronDown
          size={14}
          color={theme.muted}
          style={[styles.triggerIcon, sub.open && styles.triggerIconOpen]}
        />
      </TouchableOpacity>
    );
  },
);

NavigationMenuSubTrigger.displayName = 'NavigationMenuSubTrigger';

export const NavigationMenuSubContent = forwardRef(
  ({ children, style, ...props }, ref) => {
    const theme = useContext(NavigationMenuContext);
    const sub = useContext(NavigationMenuSubContext);
    if (!sub || !sub.open) return null;

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
  },
);

NavigationMenuSubContent.displayName = 'NavigationMenuSubContent';

const styles = StyleSheet.create({
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  triggerOpen: {
    backgroundColor: 'rgba(99,102,241,0.16)',
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  triggerIcon: {
    transform: [{ rotate: '0deg' }],
  },
  triggerIconOpen: {
    transform: [{ rotate: '180deg' }],
  },
  content: {
    width: 280,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
    marginTop: 8,
  },
  link: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  linkText: {
    fontSize: 14,
  },
  viewport: {
    width: '100%',
    marginTop: 12,
  },
  indicator: {
    height: 3,
    borderRadius: 9999,
    width: 32,
    alignSelf: 'center',
    marginTop: 8,
  },
  subTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 4,
  },
  subTriggerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subContent: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 8,
  },
});

