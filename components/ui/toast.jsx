import { X } from 'lucide-react-native';
import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

const ToastContext = createContext(null);
const toastListeners = new Set();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast) => {
      const id = toast.id ?? Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, duration: 3000, ...toast }]);
      if (toast.duration !== 0) {
        setTimeout(() => dismissToast(id), toast.duration ?? 3000);
      }
      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const handler = (toast) => addToast(toast);
    toastListeners.add(handler);
    return () => {
      toastListeners.delete(handler);
    };
  }, [addToast]);

  const contextValue = useMemo(
    () => ({
      addToast,
      dismissToast,
      toasts,
    }),
    [addToast, dismissToast, toasts],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastViewport = forwardRef(
  ({ toasts, onDismiss, style, ...props }, ref) => (
    <View ref={ref} style={[styles.viewport, style]} {...props}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onDismiss(toast.id)}
        />
      ))}
    </View>
  ),
);

ToastViewport.displayName = 'ToastViewport';

export const Toast = ({
  title,
  description,
  variant = 'default',
  action,
  onClose,
  style,
}) => {
  const translateY = React.useRef(new Animated.Value(20)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 20,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    };
  }, [translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.toast,
        variant === 'destructive' && styles.toastDestructive,
        { transform: [{ translateY }], opacity },
        style,
      ]}
    >
      <View style={styles.toastContent}>
        {title ? <Text style={styles.toastTitle}>{title}</Text> : null}
        {description ? <Text style={styles.toastDescription}>{description}</Text> : null}
      </View>
      <View style={styles.toastActions}>
        {action}
        <ToastClose onPress={onClose} />
      </View>
    </Animated.View>
  );
};

Toast.displayName = 'Toast';

export const ToastTitle = ({ children, style }) => (
  <Text style={[styles.toastTitle, style]}>{children}</Text>
);

ToastTitle.displayName = 'ToastTitle';

export const ToastDescription = ({ children, style }) => (
  <Text style={[styles.toastDescription, style]}>{children}</Text>
);

ToastDescription.displayName = 'ToastDescription';

export const ToastAction = ({ children, onPress, style }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.toastAction,
      pressed && styles.toastActionPressed,
      style,
    ]}
  >
    <Text style={styles.toastActionText}>{children}</Text>
  </Pressable>
);

ToastAction.displayName = 'ToastAction';

export const ToastClose = ({ onPress, style }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.toastClose,
      pressed && styles.toastClosePressed,
      style,
    ]}
  >
    <X size={18} color="#a1a1aa" />
  </Pressable>
);

ToastClose.displayName = 'ToastClose';

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    top: 16,
    right: 16,
    maxWidth: 360,
    gap: 12,
    zIndex: 100,
  },
  toast: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#111827',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 16,
  },
  toastDestructive: {
    backgroundColor: '#991b1b',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  toastContent: {
    flex: 1,
    gap: 4,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f4f4f5',
  },
  toastDescription: {
    fontSize: 13,
    color: '#d1d5db',
  },
  toastActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toastAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(99,102,241,0.5)',
    backgroundColor: 'transparent',
  },
  toastActionPressed: {
    backgroundColor: 'rgba(99,102,241,0.18)',
  },
  toastActionText: {
    color: '#e0e7ff',
    fontSize: 13,
    fontWeight: '600',
  },
  toastClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastClosePressed: {
    backgroundColor: 'rgba(63,63,70,0.3)',
  },
});

const emitToast = (payload) => {
  toastListeners.forEach((listener) => listener(payload));
};

export const toast = {
  show: (options) => emitToast(options),
  success: (title, description, options = {}) => {
    if (typeof title === 'object') {
      emitToast({ variant: 'default', ...title });
      return;
    }
    emitToast({
      title,
      description,
      variant: 'default',
      ...options,
    });
  },
  error: (title, description, options = {}) => {
    if (typeof title === 'object') {
      emitToast({ variant: 'destructive', ...title });
      return;
    }
    emitToast({
      title,
      description,
      variant: 'destructive',
      ...options,
    });
  },
  info: (title, description, options = {}) => {
    if (typeof title === 'object') {
      emitToast({ variant: 'default', ...title });
      return;
    }
    emitToast({
      title,
      description,
      variant: 'default',
      ...options,
    });
  },
};

