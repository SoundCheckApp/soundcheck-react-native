import { GripVertical } from 'lucide-react-native';
import React, {
    Children,
    cloneElement,
    createContext,
    forwardRef,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    PanResponder,
    StyleSheet,
    View,
} from 'react-native';

const ResizableContext = createContext(null);

const useResizable = () => {
  const context = useContext(ResizableContext);
  if (!context) {
    throw new Error(
      'ResizablePanel and ResizableHandle must be used within ResizablePanelGroup',
    );
  }
  return context;
};

export const ResizablePanelGroup = ({
  direction = 'horizontal',
  children,
  style,
  onLayout,
  ...props
}) => {
  const childArray = Children.toArray(children);
  const panels = childArray.filter(
    (child) => isValidElement(child) && child.type === ResizablePanel,
  );
  const panelCount = panels.length;

  const initialSizes = useMemo(() => {
    if (panelCount === 0) return [];
    const rawSizes = panels.map(
      (panel) => Math.max(panel.props.initialSize ?? 1, 0.1),
    );
    const total = rawSizes.reduce((sum, size) => sum + size, 0) || 1;
    return rawSizes.map((size) => size / total);
  }, [panelCount, panels]);

  const [sizes, setSizes] = useState(initialSizes);
  const sizesRef = useRef(initialSizes);

  useEffect(() => {
    setSizes(initialSizes);
    sizesRef.current = initialSizes;
  }, [initialSizes.length]);

  useEffect(() => {
    sizesRef.current = sizes;
  }, [sizes]);

  const panelConfigRef = useRef({});
  const registerPanel = useCallback((index, config) => {
    panelConfigRef.current[index] = config;
  }, []);

  const getPanelConfig = useCallback(
    (index) => panelConfigRef.current[index] || {},
    [],
  );

  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  const contextValue = useMemo(
    () => ({
      direction,
      sizes,
      setSizes,
      sizesRef,
      registerPanel,
      getPanelConfig,
      containerSize,
    }),
    [direction, sizes, registerPanel, getPanelConfig, containerSize],
  );

  let currentPanelIndex = -1;
  const processedChildren = childArray.map((child, idx) => {
    if (!isValidElement(child)) return child;

    if (child.type === ResizablePanel) {
      currentPanelIndex += 1;
      return cloneElement(child, {
        panelIndex: currentPanelIndex,
        key: child.key ?? `panel-${currentPanelIndex}`,
      });
    }

    if (child.type === ResizableHandle) {
      const beforeIndex = currentPanelIndex;
      let afterIndex = beforeIndex + 1;
      for (let i = idx + 1; i < childArray.length; i += 1) {
        const next = childArray[i];
        if (isValidElement(next) && next.type === ResizablePanel) {
          break;
        }
        if (isValidElement(next) && next.type === ResizableHandle) {
          afterIndex += 1;
        }
      }
      return cloneElement(child, {
        beforeIndex,
        afterIndex,
        key: child.key ?? `handle-${beforeIndex}-${afterIndex}`,
      });
    }

    return child;
  });

  return (
    <ResizableContext.Provider value={contextValue}>
      <View
        style={[
          direction === 'horizontal'
            ? styles.groupHorizontal
            : styles.groupVertical,
          style,
        ]}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          setContainerSize({
            width: layout.width,
            height: layout.height,
          });
          onLayout?.(event);
        }}
        {...props}
      >
        {processedChildren}
      </View>
    </ResizableContext.Provider>
  );
};

ResizablePanelGroup.displayName = 'ResizablePanelGroup';

export const ResizablePanel = forwardRef(
  (
    {
      panelIndex,
      minSize = 0.1,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { direction, sizes, registerPanel } = useResizable();

    useEffect(() => {
      registerPanel(panelIndex, { minSize });
    }, [panelIndex, minSize, registerPanel]);

    const flexSize = sizes[panelIndex] ?? 0;

    return (
      <View
        ref={ref}
        style={[
          styles.panel,
          {
            flexGrow: flexSize,
            flexBasis: 0,
          },
          direction === 'vertical' && styles.panelVertical,
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  },
);

ResizablePanel.displayName = 'ResizablePanel';

export const ResizableHandle = ({
  beforeIndex,
  afterIndex,
  withHandle = false,
  style,
  handleStyle,
  ...props
}) => {
  const {
    direction,
    sizesRef,
    setSizes,
    getPanelConfig,
    containerSize,
  } = useResizable();
  const startSizesRef = useRef(sizesRef.current);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startSizesRef.current = [...sizesRef.current];
        },
        onPanResponderMove: (_, gestureState) => {
          const total =
            direction === 'horizontal'
              ? containerSize.width
              : containerSize.height;
          if (!total || total === 0) return;

          const delta =
            direction === 'horizontal' ? gestureState.dx : gestureState.dy;
          const deltaRatio = delta / total;

          const startSizes = startSizesRef.current;
          const beforeMin = getPanelConfig(beforeIndex)?.minSize ?? 0.1;
          const afterMin = getPanelConfig(afterIndex)?.minSize ?? 0.1;

          setSizes((prev) => {
            const next = [...prev];
            let before = startSizes[beforeIndex] + deltaRatio;
            let after = startSizes[afterIndex] - deltaRatio;

            if (before < beforeMin) {
              const difference = beforeMin - before;
              before = beforeMin;
              after -= difference;
            }

            if (after < afterMin) {
              const difference = afterMin - after;
              after = afterMin;
              before -= difference;
            }

            if (before <= 0 || after <= 0) {
              return prev;
            }

            next[beforeIndex] = before;
            next[afterIndex] = after;
            sizesRef.current = next;
            return next;
          });
        },
        onPanResponderRelease: () => {
          startSizesRef.current = sizesRef.current;
        },
      }),
    [
      direction,
      beforeIndex,
      afterIndex,
      containerSize,
      getPanelConfig,
      setSizes,
      sizesRef,
    ],
  );

  return (
    <View
      style={[
        direction === 'horizontal' ? styles.handleVertical : styles.handleHorizontal,
        style,
      ]}
      {...panResponder.panHandlers}
      {...props}
    >
      {withHandle && (
        <View
          style={[
            styles.handleGrip,
            direction === 'vertical' && styles.handleGripVertical,
            handleStyle,
          ]}
        >
          <GripVertical size={14} color="#9ca3af" />
        </View>
      )}
    </View>
  );
};

ResizableHandle.displayName = 'ResizableHandle';

const styles = StyleSheet.create({
  groupHorizontal: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  groupVertical: {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  panel: {
    flexShrink: 0,
    overflow: 'hidden',
  },
  panelVertical: {
    width: '100%',
  },
  handleVertical: {
    width: 12,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'col-resize',
  },
  handleHorizontal: {
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'row-resize',
  },
  handleGrip: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(63,63,70,0.4)',
  },
  handleGripVertical: {
    transform: [{ rotate: '90deg' }],
  },
});

