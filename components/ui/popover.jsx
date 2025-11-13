import React, {
    createContext,
    forwardRef,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

const SCREEN = Dimensions.get('window');

const PopoverContext = createContext(null);

const usePopover = () => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within <Popover />');
  }
  return context;
};

export const Popover = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [triggerLayout, setTriggerLayout] = useState({
    x: SCREEN.width / 2,
    y: SCREEN.height / 2,
    width: 0,
    height: 0,
  });
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const value = useMemo(
    () => ({
      open,
      setOpen,
      triggerLayout,
      setTriggerLayout,
    }),
    [open, triggerLayout],
  );

  return (
    <PopoverContext.Provider value={value}>
      {children}
    </PopoverContext.Provider>
  );
};

Popover.displayName = 'Popover';

export const PopoverTrigger = forwardRef(
  ({ children, asChild = false, onPress, ...props }, ref) => {
    const { setOpen, setTriggerLayout } = usePopover();

    const handlePress = (event) => {
      onPress?.(event);
      event.currentTarget?.measureInWindow?.((x, y, width, height) => {
        setTriggerLayout({ x, y, width, height });
        setOpen(true);
      });
    };

    const childProps = {
      ref,
      onPress: handlePress,
      ...props,
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, childProps);
    }

    return (
      <Pressable {...childProps}>
        {children}
      </Pressable>
    );
  },
);

PopoverTrigger.displayName = 'PopoverTrigger';

export const PopoverContent = forwardRef(
  (
    {
      align = 'center',
      side = 'bottom',
      sideOffset = 8,
      style,
      children,
      avoidBackgroundPress = false,
      overlayStyle,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, triggerLayout } = usePopover();
    const [contentSize, setContentSize] = useState({ width: 0, height: 0 });

    const handleClose = () => {
      setOpen(false);
    };

    const { width, height } = contentSize;

    let x = triggerLayout.x + triggerLayout.width / 2 - width / 2;
    let y = triggerLayout.y + triggerLayout.height;

    if (align === 'start') {
      x = triggerLayout.x;
    } else if (align === 'end') {
      x = triggerLayout.x + triggerLayout.width - width;
    }

    if (side === 'top') {
      y = triggerLayout.y - height - sideOffset;
    } else if (side === 'bottom') {
      y = triggerLayout.y + triggerLayout.height + sideOffset;
    } else if (side === 'left') {
      x = triggerLayout.x - width - sideOffset;
      y = triggerLayout.y + triggerLayout.height / 2 - height / 2;
    } else if (side === 'right') {
      x = triggerLayout.x + triggerLayout.width + sideOffset;
      y = triggerLayout.y + triggerLayout.height / 2 - height / 2;
    }

    const clampedX = Math.max(
      8,
      Math.min(x, SCREEN.width - width - 8),
    );
    const clampedY = Math.max(
      8,
      Math.min(y, SCREEN.height - height - 8),
    );

    return (
      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable
          style={[StyleSheet.absoluteFill, overlayStyle]}
          onPress={!avoidBackgroundPress ? handleClose : undefined}
        />
        <View
          ref={ref}
          style={[
            styles.contentContainer,
            { top: clampedY, left: clampedX },
            style,
          ]}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setContentSize(layout);
          }}
          {...props}
        >
          {children}
        </View>
      </Modal>
    );
  },
);

PopoverContent.displayName = 'PopoverContent';

const styles = StyleSheet.create({
  contentContainer: {
    position: 'absolute',
    minWidth: 240,
    borderRadius: 12,
    backgroundColor: '#18181b',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.6)',
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
});

