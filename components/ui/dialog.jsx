import { X } from 'lucide-react-native';
import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
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

const DialogContext = createContext(null);

const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a <Dialog />');
  }
  return context;
};

const Dialog = ({ children, open: controlledOpen, defaultOpen = false, onOpenChange, ...props }) => {
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

  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <DialogContext.Provider value={value} {...props}>
      {children}
    </DialogContext.Provider>
  );
};

Dialog.displayName = 'Dialog';

const DialogTrigger = forwardRef(({ children, asChild = false, onPress, ...props }, ref) => {
  const { setOpen } = useDialog();

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

DialogTrigger.displayName = 'DialogTrigger';

const DialogPortal = ({ children }) => children;

const DialogOverlay = ({ style, onPress }) => (
  <Pressable style={[styles.overlay, style]} onPress={onPress} />
);

const DialogContent = forwardRef(
  ({ children, style, overlayStyle, contentContainerStyle, ...props }, ref) => {
    const { open, setOpen } = useDialog();

    const handleClose = () => setOpen(false);

    return (
      <Modal
        transparent
        animationType="fade"
        visible={open}
        onRequestClose={handleClose}
      >
        <DialogOverlay onPress={handleClose} style={overlayStyle} />
        <View style={[styles.center]} pointerEvents="box-none">
          <View
            ref={ref}
            style={[styles.content, style]}
            {...props}
          >
            {children}
          </View>
        </View>
      </Modal>
    );
  },
);

DialogContent.displayName = 'DialogContent';

const DialogClose = forwardRef(({ children, asChild = false, onPress, style, ...props }, ref) => {
  const { setOpen } = useDialog();

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
    <Pressable ref={ref} onPress={handlePress} style={[styles.closeButton, style]} {...props}>
      {children ?? (
        <>
          <X size={18} color="#a1a1aa" />
          <Text style={styles.srText}>Close</Text>
        </>
      )}
    </Pressable>
  );
});

DialogClose.displayName = 'DialogClose';

const DialogHeader = ({ children, style, ...props }) => (
  <View style={[styles.header, style]} {...props}>
    {children}
  </View>
);

DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ children, style, ...props }) => (
  <View style={[styles.footer, style]} {...props}>
    {children}
  </View>
);

DialogFooter.displayName = 'DialogFooter';

const DialogTitle = forwardRef(({ children, style, ...props }, ref) => (
  <Text ref={ref} style={[styles.title, style]} {...props}>
    {children}
  </Text>
));

DialogTitle.displayName = 'DialogTitle';

const DialogDescription = forwardRef(({ children, style, ...props }, ref) => (
  <Text ref={ref} style={[styles.description, style]} {...props}>
    {children}
  </Text>
));

DialogDescription.displayName = 'DialogDescription';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: '#18181b',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63, 63, 70, 0.6)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.7)',
  },
  header: {
    marginBottom: 16,
    gap: 6,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  srText: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
});

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger
};

