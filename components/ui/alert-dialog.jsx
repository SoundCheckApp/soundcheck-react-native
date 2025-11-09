import React, { createContext, useContext, useEffect, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AlertDialogContext = createContext({
  isOpen: false,
  setIsOpen: () => {},
});

const AlertDialog = ({ children, open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setIsOpen = (value) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  return (
    <AlertDialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogTrigger = ({ children, asChild, ...props }) => {
  const { setIsOpen } = useContext(AlertDialogContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onPress: () => {
        children.props.onPress?.();
        setIsOpen(true);
      },
    });
  }

  return (
    <TouchableOpacity onPress={() => setIsOpen(true)} {...props}>
      {children}
    </TouchableOpacity>
  );
};

const AlertDialogPortal = ({ children }) => children;

const AlertDialogOverlay = ({ style }) => <View style={[styles.overlay, style]} />;

const AlertDialogContent = ({ children, style, onDismiss, ...props }) => {
  const { isOpen, setIsOpen } = useContext(AlertDialogContext);
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
    }
  }, [isOpen, scaleAnim, opacityAnim]);

  const handleClose = () => {
    onDismiss?.();
    setIsOpen(false);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      {...props}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose} />
        <Animated.View
          style={[
            styles.content,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            style,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const AlertDialogHeader = ({ children, style, ...props }) => (
  <View style={[styles.header, style]} {...props}>
    {children}
  </View>
);

const AlertDialogFooter = ({ children, style, ...props }) => (
  <View style={[styles.footer, style]} {...props}>
    {children}
  </View>
);

const AlertDialogTitle = ({ children, style, ...props }) => (
  <Text style={[styles.title, style]} {...props}>
    {children}
  </Text>
);

const AlertDialogDescription = ({ children, style, ...props }) => (
  <Text style={[styles.description, style]} {...props}>
    {children}
  </Text>
);

const AlertDialogAction = ({ children, style, onPress, ...props }) => {
  const { setIsOpen } = useContext(AlertDialogContext);
  return (
    <TouchableOpacity
      style={[styles.actionButton, style]}
      onPress={() => {
        onPress?.();
        setIsOpen(false);
      }}
      {...props}
    >
      <Text style={styles.actionButtonText}>{children}</Text>
    </TouchableOpacity>
  );
};

const AlertDialogCancel = ({ children, style, onPress, ...props }) => {
  const { setIsOpen } = useContext(AlertDialogContext);
  return (
    <TouchableOpacity
      style={[styles.cancelButton, style]}
      onPress={() => {
        onPress?.();
        setIsOpen(false);
      }}
      {...props}
    >
      <Text style={styles.cancelButtonText}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  content: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3f3f46',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#e4e4e7',
    fontSize: 16,
    fontWeight: '500',
  },
});

export {
    AlertDialog, AlertDialogAction,
    AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger
};

