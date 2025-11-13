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
    Animated,
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const DrawerContext = createContext(null);

const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('Drawer components must be used within a <Drawer />');
  }
  return context;
};

const Drawer = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  shouldScaleBackground = true,
  ...props
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (nextOpen) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const value = useMemo(
    () => ({
      open,
      setOpen,
      shouldScaleBackground,
    }),
    [open, setOpen, shouldScaleBackground],
  );

  return (
    <DrawerContext.Provider value={value} {...props}>
      {children}
    </DrawerContext.Provider>
  );
};

Drawer.displayName = 'Drawer';

const DrawerTrigger = forwardRef(({ children, onPress, asChild = false, ...props }, ref) => {
  const { setOpen } = useDrawer();

  const handlePress = (event) => {
    onPress?.(event);
    setOpen(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onPress: handlePress,
      ref,
      ...props,
    });
  }

  return (
    <Pressable ref={ref} onPress={handlePress} {...props}>
      {children}
    </Pressable>
  );
});

DrawerTrigger.displayName = 'DrawerTrigger';

const DrawerPortal = ({ children }) => children;

const DrawerOverlay = ({ style, ...props }) => (
  <Pressable style={[styles.overlay, style]} {...props} />
);

DrawerOverlay.displayName = 'DrawerOverlay';

const DrawerClose = forwardRef(({ children, onPress, asChild = false, ...props }, ref) => {
  const { setOpen } = useDrawer();

  const handlePress = (event) => {
    onPress?.(event);
    setOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onPress: handlePress,
      ref,
      ...props,
    });
  }

  return (
    <Pressable ref={ref} onPress={handlePress} {...props}>
      {children}
    </Pressable>
  );
});

DrawerClose.displayName = 'DrawerClose';

const DrawerContent = forwardRef(
  (
    {
      children,
      style,
      contentStyle,
      overlayStyle,
      enableBackdropDismiss = true,
      snapPoint = 0.4,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, shouldScaleBackground } = useDrawer();
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const heightPercent = Math.min(Math.max(snapPoint, 0.25), 0.95);
    const targetTranslate = SCREEN_HEIGHT * (1 - heightPercent);

    useEffect(() => {
      if (open) {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: targetTranslate,
            duration: 250,
            useNativeDriver: true,
          }),
          shouldScaleBackground
            ? Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 250,
                useNativeDriver: true,
              })
            : Animated.delay(0),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }),
          shouldScaleBackground
            ? Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              })
            : Animated.delay(0),
        ]).start();
      }
    }, [open, translateY, targetTranslate, shouldScaleBackground, scaleAnim]);

    const handleBackdropPress = () => {
      if (enableBackdropDismiss) {
        setOpen(false);
      }
    };

    return (
      <Modal transparent animationType="none" visible={open} onRequestClose={() => setOpen(false)}>
        <View style={styles.absoluteFill}>
          <Animated.View style={[styles.backdrop, overlayStyle]} />
          <Pressable style={styles.flexFill} onPress={handleBackdropPress} />
          <Animated.View
            ref={ref}
            style={[
              styles.sheet,
              {
                transform: [{ translateY }],
              },
              style,
            ]}
            {...props}
          >
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
            <View style={[styles.contentInner, contentStyle]}>{children}</View>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({ children, style, ...props }) => (
  <View style={[styles.header, style]} {...props}>
    {children}
  </View>
);

DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({ children, style, ...props }) => (
  <View style={[styles.footer, style]} {...props}>
    {children}
  </View>
);

DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = forwardRef(({ children, style, ...props }, ref) => (
  <Text ref={ref} style={[styles.title, style]} {...props}>
    {children}
  </Text>
));

DrawerTitle.displayName = 'DrawerTitle';

const DrawerDescription = forwardRef(({ children, style, ...props }, ref) => (
  <Text ref={ref} style={[styles.description, style]} {...props}>
    {children}
  </Text>
));

DrawerDescription.displayName = 'DrawerDescription';

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  flexFill: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63, 63, 70, 0.6)',
    paddingBottom: 32,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 100,
    height: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(113, 113, 122, 0.7)',
  },
  contentInner: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  footer: {
    marginTop: 'auto',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f4f4f5',
  },
  description: {
    fontSize: 14,
    color: '#a1a1aa',
  },
});

export {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerPortal,
    DrawerTitle,
    DrawerTrigger
};

