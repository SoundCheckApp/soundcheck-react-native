import { Search } from 'lucide-react-native';
import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { Dialog, DialogContent } from '@/components/ui/dialog';

const THEMES = {
  light: {
    background: '#18181b',
    foreground: '#e4e4e7',
    muted: '#71717a',
    border: 'rgba(113, 113, 122, 0.4)',
    accent: 'rgba(99, 102, 241, 0.15)',
  },
};

const getTextContent = (children) => {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return child.toString();
      }
      if (React.isValidElement(child)) {
        return getTextContent(child.props.children);
      }
      return '';
    })
    .join(' ')
    .trim();
};

const CommandContext = createContext(null);

const useCommandContext = () => {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error('Command components must be used within <Command />');
  }
  return context;
};

const Command = forwardRef(
  ({ children, style, theme = THEMES.light, ...props }, ref) => {
    const [query, setQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(0);
    const visibilityMap = useRef(new Map());

    const reportVisibility = useCallback((id, visible) => {
      const previous = visibilityMap.current.get(id);
      if (previous === visible) return;

      visibilityMap.current.set(id, visible);
      setVisibleCount(
        Array.from(visibilityMap.current.values()).filter(Boolean).length,
      );
    }, []);

    const unregisterVisibility = useCallback((id) => {
      if (visibilityMap.current.has(id)) {
        visibilityMap.current.delete(id);
        setVisibleCount(
          Array.from(visibilityMap.current.values()).filter(Boolean).length,
        );
      }
    }, []);

    const value = useMemo(
      () => ({
        query,
        setQuery,
        visibleCount,
        theme,
        reportVisibility,
        unregisterVisibility,
      }),
      [query, visibleCount, theme, reportVisibility, unregisterVisibility],
    );

    return (
      <CommandContext.Provider value={value}>
        <View ref={ref} style={[styles.container, { backgroundColor: theme.background }, style]} {...props}>
          {children}
        </View>
      </CommandContext.Provider>
    );
  },
);

Command.displayName = 'Command';

const CommandDialog = ({ children, contentStyle, ...props }) => (
  <Dialog {...props}>
    <DialogContent style={[styles.dialogContent, contentStyle]}>
      <Command>{children}</Command>
    </DialogContent>
  </Dialog>
);

const CommandInput = forwardRef(
  ({ style, icon = <Search size={18} color="#a1a1aa" />, value, onChangeText, placeholder = 'Search…', ...props }, ref) => {
    const { query, setQuery, theme } = useCommandContext();
    const isControlled = value !== undefined;

    const handleChange = (text) => {
      if (!isControlled) {
        setQuery(text);
      }
      onChangeText?.(text);
    };

    return (
      <View style={[styles.inputWrapper, { borderColor: theme.border }, style]}>
        {icon}
        <TextInput
          ref={ref}
          style={[styles.input, { color: theme.foreground }]}
          value={isControlled ? value : query}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={theme.muted}
          {...props}
        />
      </View>
    );
  },
);

CommandInput.displayName = 'CommandInput';

const CommandList = forwardRef(({ children, style, ...props }, ref) => {
  const { theme } = useCommandContext();
  return (
    <ScrollView
      ref={ref}
      style={[styles.list, { borderColor: theme.border }, style]}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </ScrollView>
  );
});

CommandList.displayName = 'CommandList';

const CommandEmpty = forwardRef(({ style, textStyle, children, ...props }, ref) => {
  const { visibleCount, theme, query } = useCommandContext();
  if (visibleCount > 0 || query.length === 0) {
    return null;
  }
  return (
    <View ref={ref} style={[styles.empty, style]} {...props}>
      <Text style={[styles.emptyText, { color: theme.muted }, textStyle]}>
        {children || 'No results found'}
      </Text>
    </View>
  );
});

CommandEmpty.displayName = 'CommandEmpty';

const CommandGroup = forwardRef(
  ({ heading, children, style, headingStyle, ...props }, ref) => {
    const { theme } = useCommandContext();
    return (
      <View ref={ref} style={[styles.group, style]} {...props}>
        {heading ? (
          <Text
            style={[
              styles.groupHeading,
              { color: theme.muted },
              headingStyle,
            ]}
          >
            {heading}
          </Text>
        ) : null}
        <View>{children}</View>
      </View>
    );
  },
);

CommandGroup.displayName = 'CommandGroup';

const CommandSeparator = forwardRef(({ style, ...props }, ref) => {
  const { theme } = useCommandContext();
  return (
    <View
      ref={ref}
      style={[styles.separator, { backgroundColor: theme.border }, style]}
      {...props}
    />
  );
});

CommandSeparator.displayName = 'CommandSeparator';

const CommandItem = forwardRef(
  (
    {
      value = '',
      disabled = false,
      onSelect,
      onPress,
      style,
      textStyle,
      children,
      ...props
    },
    ref,
  ) => {
    const { query, theme, reportVisibility, unregisterVisibility } =
      useCommandContext();
    const itemId = useRef(Symbol('command-item'));
    const haystack =
      value.toLowerCase() +
      ' ' +
      getTextContent(children).toLowerCase();
    const needle = query.trim().toLowerCase();
    const isVisible = needle.length === 0 || haystack.includes(needle);

    useEffect(() => {
      reportVisibility(itemId.current, !disabled && isVisible);
      return () => {
        unregisterVisibility(itemId.current);
      };
    }, [isVisible, disabled, reportVisibility, unregisterVisibility]);

    if (!isVisible) {
      return null;
    }

    const handlePress = () => {
      if (disabled) return;
      onSelect?.(value);
      onPress?.();
    };

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.item,
          { backgroundColor: pressed ? theme.accent : 'transparent' },
          disabled && styles.itemDisabled,
          style,
        ]}
        {...props}
      >
        {typeof children === 'string' || typeof children === 'number' ? (
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

CommandItem.displayName = 'CommandItem';

const CommandShortcut = ({ style, children, ...props }) => {
  const { theme } = useCommandContext();
  return (
    <Text
      style={[styles.shortcut, { color: theme.muted }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

CommandShortcut.displayName = 'CommandShortcut';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dialogContent: {
    padding: 0,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 200,
    width: '90%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 48,
    gap: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  list: {
    maxHeight: 320,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  empty: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  group: {
    paddingVertical: 8,
    gap: 4,
  },
  groupHeading: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
    opacity: 0.6,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemText: {
    fontSize: 16,
  },
  shortcut: {
    marginLeft: 'auto',
    fontSize: 12,
    letterSpacing: 1,
  },
});

export {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut
};

