import { ArrowLeft, ArrowRight } from 'lucide-react-native';
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
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from './button';

/**
 * @typedef {Object} CarouselApi
 * @property {number} currentIndex
 * @property {(index: number, animated?: boolean) => void} scrollToIndex
 * @property {() => void} scrollNext
 * @property {() => void} scrollPrev
 */

const CarouselContext = createContext(null);

const useCarousel = () => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a Carousel');
  }
  return context;
};

const Carousel = forwardRef(
  (
    {
      orientation = 'horizontal',
      className,
      style,
      children,
      setApi,
      ...props
    },
    ref,
  ) => {
    const scrollViewRef = useRef(null);
    const [itemIds, setItemIds] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [containerSize, setContainerSize] = useState(() => {
      const { width, height } = Dimensions.get('window');
      return { width, height };
    });

    const isHorizontal = orientation === 'horizontal';

    const registerItem = useCallback((id) => {
      setItemIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }, []);

    const unregisterItem = useCallback((id) => {
      setItemIds((prev) => prev.filter((itemId) => itemId !== id));
    }, []);

    const scrollToIndex = useCallback(
      (index, animated = true) => {
        if (!scrollViewRef.current) return;
        const clampedIndex = Math.max(0, Math.min(index, itemIds.length - 1));
        const offset = isHorizontal
          ? { x: clampedIndex * containerSize.width, y: 0 }
          : { x: 0, y: clampedIndex * containerSize.height };

        scrollViewRef.current.scrollTo({
          ...offset,
          animated,
        });
        setCurrentIndex(clampedIndex);
      },
      [containerSize.height, containerSize.width, isHorizontal, itemIds.length],
    );

    const scrollPrev = useCallback(() => {
      scrollToIndex(currentIndex - 1);
    }, [currentIndex, scrollToIndex]);

    const scrollNext = useCallback(() => {
      scrollToIndex(currentIndex + 1);
    }, [currentIndex, scrollToIndex]);

    const canScrollPrev = currentIndex > 0;
    const canScrollNext = currentIndex < itemIds.length - 1;

    useEffect(() => {
      if (!setApi) return;
      const api = {
        currentIndex,
        scrollToIndex,
        scrollNext,
        scrollPrev,
      };
      setApi(api);
    }, [currentIndex, scrollNext, scrollPrev, scrollToIndex, setApi]);

    const handleMomentumEnd = useCallback(
      (event) => {
        const offset = event.nativeEvent.contentOffset;
        const nextIndex = isHorizontal
          ? Math.round(offset.x / containerSize.width)
          : Math.round(offset.y / containerSize.height);
        setCurrentIndex(nextIndex);
      },
      [containerSize.height, containerSize.width, isHorizontal],
    );

    const value = useMemo(
      () => ({
        orientation,
        scrollViewRef,
        registerItem,
        unregisterItem,
        containerSize,
        setContainerSize,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        itemCount: itemIds.length,
        currentIndex,
        handleMomentumEnd,
      }),
      [
        orientation,
        registerItem,
        unregisterItem,
        containerSize,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        itemIds.length,
        currentIndex,
        handleMomentumEnd,
      ],
    );

    return (
      <CarouselContext.Provider value={value}>
        <View
          ref={ref}
          style={[styles.container, style]}
          accessibilityRole="adjustable"
          {...props}
        >
          {children}
        </View>
      </CarouselContext.Provider>
    );
  },
);

Carousel.displayName = 'Carousel';

const CarouselContent = forwardRef(({ children, style, ...props }, ref) => {
  const {
    orientation,
    scrollViewRef,
    setContainerSize,
    handleMomentumEnd,
    containerSize,
  } = useCarousel();

  const isHorizontal = orientation === 'horizontal';

  return (
    <View
      style={styles.viewport}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerSize({ width, height });
      }}
    >
      <ScrollView
        ref={(node) => {
          scrollViewRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        horizontal={isHorizontal}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        snapToInterval={
          isHorizontal ? containerSize.width : containerSize.height
        }
        decelerationRate="fast"
        contentContainerStyle={[
          isHorizontal ? styles.horizontalContent : styles.verticalContent,
          style,
        ]}
        {...props}
      >
        {children}
      </ScrollView>
    </View>
  );
});

CarouselContent.displayName = 'CarouselContent';

const CarouselItem = forwardRef(({ children, style, ...props }, ref) => {
  const { orientation, registerItem, unregisterItem, containerSize } =
    useCarousel();
  const itemId = useRef(Symbol('carousel-item'));
  const isHorizontal = orientation === 'horizontal';

  useEffect(() => {
    registerItem(itemId.current);
    return () => unregisterItem(itemId.current);
  }, [registerItem, unregisterItem]);

  return (
    <View
      ref={ref}
      style={[
        styles.item,
        isHorizontal
          ? { width: containerSize.width, paddingLeft: 16 }
          : { height: containerSize.height, paddingTop: 16 },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});

CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = forwardRef(({ style, ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  const isHorizontal = orientation === 'horizontal';

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      onPress={scrollPrev}
      disabled={!canScrollPrev}
      style={[
        styles.control,
        isHorizontal ? styles.controlLeft : styles.controlTop,
        style,
      ]}
      {...props}
    >
      <ArrowLeft size={16} color="#f4f4f5" />
    </Button>
  );
});

CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = forwardRef(({ style, ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  const isHorizontal = orientation === 'horizontal';

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      onPress={scrollNext}
      disabled={!canScrollNext}
      style={[
        styles.control,
        isHorizontal ? styles.controlRight : styles.controlBottom,
        style,
      ]}
      {...props}
    >
      <ArrowRight size={16} color="#f4f4f5" />
    </Button>
  );
});

CarouselNext.displayName = 'CarouselNext';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  viewport: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  horizontalContent: {
    alignItems: 'stretch',
  },
  verticalContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  item: {
    flexShrink: 0,
    flexGrow: 0,
  },
  control: {
    position: 'absolute',
    height: 48,
    width: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlLeft: {
    left: -56,
    top: '50%',
    transform: [{ translateY: -24 }],
  },
  controlRight: {
    right: -56,
    top: '50%',
    transform: [{ translateY: -24 }],
  },
  controlTop: {
    top: -56,
    left: '50%',
    transform: [{ translateX: -24 }],
  },
  controlBottom: {
    bottom: -56,
    left: '50%',
    transform: [{ translateX: -24 }],
  },
});

export {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
};

