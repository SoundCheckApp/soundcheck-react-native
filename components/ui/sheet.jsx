import { X } from 'lucide-react-native';
import React, {
    createContext,
    forwardRef,
    useMemo,
    useState,
} from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const SheetContext = createContext(null);

const useSheet = () => {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error('Sheet components must be used within <Sheet />');
  }
  return context;
};

export const Sheet = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      side: 'right',
      setSide: () => {},
    }),
    [open],
  );

  return (
    <SheetContext.Provider value={contextValue}>
      {children}
    </SheetContext.Provider>
  );
};

Sheet.displayName = 'Sheet';

export const SheetTrigger = ({ asChild = false, children }) => {
  const { setOpen } = useSheet();
  const onPress = () => setOpen(true);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onPress,
    });
  }

  return (
    <Pressable onPress={onPress}>
      {children}
    </Pressable>
  );
};

export const SheetPortal = ({ children }) => children;

export const SheetOverlay = ({ style }) => (
  <View style={[styles.overlay, style]} />
);

SheetOverlay.displayName = 'SheetOverlay';

const sheetVariants = {
  top: styles.contentTop,
  bottom: styles.contentBottom,
  left: styles.contentLeft,
  right: styles.contentRight,
};

export const SheetContent = forwardRef(
  (
    {
      side = 'right',
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen } = useSheet();
    const sideStyle = sheetVariants[side] || sheetVariants.right;

    return (
      <SheetPortal>
        <Modal
          transparent
          visible={open}
          animationType="slide"
          onRequestClose={() => setOpen(false)}
        >
          <SheetOverlay />
          <View style={[styles.content, sideStyle, style]} ref={ref} {...props}>
            {children}
            <SheetClose style={styles.closeButton}>
              <X size={18} color="#a1a1aa" />
            </SheetClose>
          </View>
        </Modal>
      </SheetPortal>
    );
  },
);

SheetContent.displayName = 'SheetContent';

export const SheetClose = ({ asChild = false, children, style }) => {
  const { setOpen } = useSheet();
  const onPress = () => setOpen(false);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onPress,
    });
  }

  return (
    <Pressable style={style} onPress={onPress}>
      {children || <Text style={styles.closeText}>Close</Text>}
    </Pressable>
  );
};

SheetClose.displayName = 'SheetClose';

export const SheetHeader = ({ style, children }) => (
  <View style={[styles.header, style]}>{children}</View>
);

SheetHeader.displayName = 'SheetHeader';

export const SheetFooter = ({ style, children }) => (
  <View style={[styles.footer, style]}>{children}</View>
);

SheetFooter.displayName = 'SheetFooter';

export const SheetTitle = ({ style, children }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

SheetTitle.displayName = 'SheetTitle';

export const SheetDescription = ({ style, children }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

SheetDescription.displayName = 'SheetDescription';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  content: {
    position: 'absolute',
    backgroundColor: '#18181b',
    borderColor: 'rgba(63,63,70,0.6)',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    gap: 16,
    minHeight: 200,
    minWidth: 280,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 20,
  },
  contentTop: {
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  contentBottom: {
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentLeft: {
    left: 0,
    top: 0,
    bottom: 0,
    width: '75%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  contentRight: {
    right: 0,
    top: 0,
    bottom: 0,
    width: '75%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(63,63,70,0.7)',
  },
  closeText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  header: {
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f4f4f5',
  },
  description: {
    fontSize: 14,
    color: '#a1a1aa',
  },
});

