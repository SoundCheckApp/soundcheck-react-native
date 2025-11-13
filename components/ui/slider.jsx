import SliderNative from '@react-native-community/slider';
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

export const Slider = forwardRef(
  (
    {
      value,
      defaultValue = 0,
      minimumValue = 0,
      maximumValue = 100,
      step = 1,
      disabled = false,
      onValueChange,
      onSlidingComplete,
      style,
      minimumTrackTintColor = '#6366f1',
      maximumTrackTintColor = 'rgba(63,63,70,0.5)',
      thumbTintColor = '#f8fafc',
      ...props
    },
    ref,
  ) => {
    const sliderRef = useRef(null);
    const [internalValue, setInternalValue] = useState(
      value ?? defaultValue ?? minimumValue,
    );
    const isControlled = value !== undefined && value !== null;

    useEffect(() => {
      if (isControlled) {
        setInternalValue(value);
      }
    }, [value, isControlled]);

    useImperativeHandle(ref, () => ({
      setNativeProps: (...args) => sliderRef.current?.setNativeProps?.(...args),
      focus: () => sliderRef.current?.focus?.(),
      blur: () => sliderRef.current?.blur?.(),
    }));

    const handleValueChange = (val) => {
      if (!isControlled) {
        setInternalValue(val);
      }
      onValueChange?.(val);
    };

    return (
      <View style={[styles.container, style]}>
        <SliderNative
          ref={sliderRef}
          value={internalValue}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          disabled={disabled}
          minimumTrackTintColor={minimumTrackTintColor}
          maximumTrackTintColor={maximumTrackTintColor}
          thumbTintColor={thumbTintColor}
          onValueChange={handleValueChange}
          onSlidingComplete={onSlidingComplete}
          {...props}
        />
      </View>
    );
  },
);

Slider.displayName = 'Slider';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
  },
});

