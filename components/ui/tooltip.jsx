import React, {
    createContext,
    forwardRef,
    useMemo,
    useState
} from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const TooltipContext = createContext(null);

export const TooltipProvider = ({ children }) => {
  const value = useMemo(() => ({}), []);
  return (
    <TooltipContext.Provider value={value}>
      {children}
    </TooltipContext.Provider>
  );
};

export const Tooltip = ({ children }) => children;

export const TooltipTrigger = ({ children, onPressIn, onPressOut, delay = 200, ...props }) => {
  const [visible, setVisible] = useState(false);
  const [layout, setLayout] = useState(null);

  const showTimeoutRef = React.useRef();

  const handlePressIn = (event) => {
    onPressIn?.(event);
    clearTimeout(showTimeoutRef.current);
    event.target.measureInWindow?.((x, y, width, height) => {
      setLayout({ x, y, width, height });
      showTimeoutRef.current = setTimeout(() => setVisible(true), delay);
    });
  };

  const handlePressOut = (event) => {
    onPressOut?.(event);
    clearTimeout(showTimeoutRef.current);
    setVisible(false);
  };

  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      accessibilityRole: 'button',
      ...props,
      layout,
      visible,
    });
  }

  return children;
};

export const TooltipContent = forwardRef(
  (
    {
      children,
      side = 'top',
      align = 'center',
      sideOffset = 8,
      style,
      ...props
    },
    ref,
  ) => {
    const triggerProps = props.triggerProps;
    const visible = triggerProps?.visible;
    const layout = triggerProps?.layout;

    if (!visible || !layout) {
      return null;
    }

    const { width: screenWidth } = Dimensions.get('window');
    let top = layout.y - sideOffset;
    let left = layout.x + layout.width / 2;

    if (side === 'bottom') {
      top = layout.y + layout.height + sideOffset;
    } else if (side === 'left') {
      left = layout.x - sideOffset;
    } else if (side === 'right') {
      left = layout.x + layout.width + sideOffset;
    }

    if (align === 'start') {
      left = layout.x;
    } else if (align === 'end') {
      left = layout.x + layout.width;
    }

    const tooltipStyle = {
      position: 'absolute',
      top,
      left: Math.max(12, Math.min(left, screenWidth - 12)),
    };

    return (
      <Modal transparent visible={visible} animationType="fade">
        <Pressable style={StyleSheet.absoluteFill} />
        <View ref={ref} style={[styles.tooltip, tooltipStyle, style]} {...props}>
          <Text style={styles.text}>{children}</Text>
        </View>
      </Modal>
    );
  },
);

TooltipContent.displayName = 'TooltipContent';

const styles = StyleSheet.create({
  tooltip: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    maxWidth: 220,
  },
  text: {
    color: '#f4f4f5',
    fontSize: 13,
  },
});

