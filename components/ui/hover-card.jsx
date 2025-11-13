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
    View,
} from 'react-native';

const SCREEN = Dimensions.get('window');

const HoverCardContext = createContext(null);

const useHoverCard = () => {
  const context = useContext(HoverCardContext);
  if (!context) {
    throw new Error('HoverCard components must be used within <HoverCard />');
  }
  return context;
};

const HoverCard = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeDelay = 150,
  openDelay = 150,
  ...props
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [anchor, setAnchor] = useState({
    x: SCREEN.width / 2,
    y: SCREEN.height / 2,
    width: 0,
    height: 0,
  });
  const closeTimeout = useRef(null);
  const openTimeout = useRef(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const clearTimers = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    if (openTimeout.current) {
      clearTimeout(openTimeout.current);
      openTimeout.current = null;
    }
  };

  const setOpen = useCallback(
    (next) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const delayedOpen = useCallback(() => {
    clearTimers();
    openTimeout.current = setTimeout(() => setOpen(true), openDelay);
  }, [openDelay, setOpen]);

  const delayedClose = useCallback(() => {
    clearTimers();
    closeTimeout.current = setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay, setOpen]);

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      anchor,
      setAnchor,
      delayedOpen,
      delayedClose,
      clearTimers,
    }),
    [open, setOpen, anchor, delayedOpen, delayedClose],
  );

  return (
    <HoverCardContext.Provider value={contextValue} {...props}>
      {children}
    </HoverCardContext.Provider>
  );
};

HoverCard.displayName = 'HoverCard';

const HoverCardTrigger = forwardRef(
  ({ children, asChild = false, onPressIn, onPressOut, onLongPress, ...props }, ref) => {
    const { delayedOpen, delayedClose, clearTimers, setAnchor } = useHoverCard();
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

    const measureAndOpen = () => {
      const node = triggerRef.current;
      if (node && typeof node.measureInWindow === 'function') {
        node.measureInWindow((x, y, width, height) => {
          setAnchor({ x, y, width, height });
          delayedOpen();
        });
      } else {
        delayedOpen();
      }
    };

    const handlePressIn = (event) => {
      onPressIn?.(event);
      measureAndOpen();
    };

    const handleLongPress = (event) => {
      onLongPress?.(event);
      measureAndOpen();
    };

    const handlePressOut = (event) => {
      onPressOut?.(event);
      delayedClose();
    };

    const childProps = {
      ref: attachRef,
      onPressIn: handlePressIn,
      onLongPress: handleLongPress,
      onPressOut: handlePressOut,
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

HoverCardTrigger.displayName = 'HoverCardTrigger';

const HoverCardContent = forwardRef(
  (
    {
      children,
      align = 'center',
      side = 'top',
      sideOffset = 8,
      style,
      overlayStyle,
      avoidBackgroundPress = false,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, anchor, delayedClose, clearTimers } = useHoverCard();
    const [contentSize, setContentSize] = useState({ width: 0, height: 0 });

    const handleClose = () => {
      clearTimers();
      setOpen(false);
    };

    const computePosition = () => {
      const width = contentSize.width || 1;
      const height = contentSize.height || 1;

      let x = anchor.x;
      let y = anchor.y;

      switch (side) {
        case 'bottom':
          y = anchor.y + anchor.height + sideOffset;
          break;
        case 'left':
          x = anchor.x - width - sideOffset;
          break;
        case 'right':
          x = anchor.x + anchor.width + sideOffset;
          break;
        case 'top':
        default:
          y = anchor.y - height - sideOffset;
          break;
      }

      switch (align) {
        case 'start':
          if (side === 'top' || side === 'bottom') {
            x = anchor.x;
          } else {
            y = anchor.y;
          }
          break;
        case 'end':
          if (side === 'top' || side === 'bottom') {
            x = anchor.x + anchor.width - width;
          } else {
            y = anchor.y + anchor.height - height;
          }
          break;
        case 'center':
        default:
          if (side === 'top' || side === 'bottom') {
            x = anchor.x + anchor.width / 2 - width / 2;
          } else {
            y = anchor.y + anchor.height / 2 - height / 2;
          }
          break;
      }

      const clampedX = Math.max(8, Math.min(x, SCREEN.width - width - 8));
      const clampedY = Math.max(8, Math.min(y, SCREEN.height - height - 8));

      return { top: clampedY, left: clampedX };
    };

    const position = computePosition();

    return (
      <Modal
        transparent
        animationType="fade"
        visible={open}
        onRequestClose={handleClose}
      >
        <Pressable
          style={[styles.backdrop, overlayStyle]}
          onPress={!avoidBackgroundPress ? handleClose : undefined}
        />
        <View
          ref={ref}
          style={[styles.content, position, style]}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setContentSize({ width, height });
          }}
          onTouchStart={clearTimers}
          onTouchEnd={delayedClose}
          {...props}
        >
          {children}
        </View>
      </Modal>
    );
  },
);

HoverCardContent.displayName = 'HoverCardContent';

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  content: {
    position: 'absolute',
    width: 256,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63, 63, 70, 0.6)',
    backgroundColor: '#18181b',
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
});

export { HoverCard, HoverCardContent, HoverCardTrigger };

