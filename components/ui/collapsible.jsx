import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import { Pressable, View } from 'react-native';

const CollapsibleContext = createContext(null);

const useCollapsibleContext = () => {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error('Collapsible components must be used within <Collapsible />');
  }
  return context;
};

const Collapsible = forwardRef(
  (
    {
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    const setOpen = useCallback(
      (nextValue) => {
        if (disabled) return;

        const normalizedValue =
          typeof nextValue === 'function' ? nextValue(open) : nextValue;

        if (!isControlled) {
          setInternalOpen(normalizedValue);
        }
        onOpenChange?.(normalizedValue);
      },
      [disabled, isControlled, onOpenChange, open],
    );

    const toggle = useCallback(() => {
      setOpen(!open);
    }, [open, setOpen]);

    const value = useMemo(
      () => ({
        open,
        disabled,
        setOpen,
        toggle,
      }),
      [open, disabled, setOpen, toggle],
    );

    return (
      <CollapsibleContext.Provider value={value}>
        <View ref={ref} style={style} {...props}>
          {children}
        </View>
      </CollapsibleContext.Provider>
    );
  },
);

Collapsible.displayName = 'Collapsible';

const CollapsibleTrigger = forwardRef(
  ({ children, onPress, disabled: disabledProp = false, style, ...props }, ref) => {
    const { open, toggle, disabled } = useCollapsibleContext();
    const isDisabled = disabled || disabledProp;

    const handlePress = (event) => {
      if (isDisabled) return;
      onPress?.(event);
      toggle();
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled: isDisabled }}
        style={style}
        {...props}
      >
        {typeof children === 'function' ? children({ open, disabled: isDisabled }) : children}
      </Pressable>
    );
  },
);

CollapsibleTrigger.displayName = 'CollapsibleTrigger';

const CollapsibleContent = forwardRef(({ children, style, ...props }, ref) => {
  const { open } = useCollapsibleContext();

  if (!open) {
    return null;
  }

  return (
    <View ref={ref} style={style} {...props}>
      {children}
    </View>
  );
});

CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleContent, CollapsibleTrigger };

