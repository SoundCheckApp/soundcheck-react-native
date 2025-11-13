import { Dot } from 'lucide-react-native';
import React, {
    createContext,
    forwardRef,
    useContext,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const InputOTPContext = createContext(null);

const useInputOTPContext = () => {
  const context = useContext(InputOTPContext);
  if (!context) {
    throw new Error('InputOTP compound components must be used within <InputOTP />');
  }
  return context;
};

const sanitizeValue = (value, length, onlyDigits) => {
  if (!value) return '';
  const pattern = onlyDigits ? /[^0-9]/g : /[^a-zA-Z0-9]/g;
  return value.replace(pattern, '').slice(0, length);
};

const InputOTP = forwardRef(
  (
    {
      length = 6,
      value,
      defaultValue = '',
      onChange,
      containerStyle,
      style,
      inputStyle,
      autoFocus = false,
      onlyDigits = true,
      editable = true,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef(null);
    const [internalValue, setInternalValue] = useState(() =>
      sanitizeValue(defaultValue, length, onlyDigits),
    );
    const [isFocused, setIsFocused] = useState(false);

    const controlled = value !== undefined;
    const currentValue = sanitizeValue(
      controlled ? value : internalValue,
      length,
      onlyDigits,
    );

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        if (!controlled) {
          setInternalValue('');
        }
        inputRef.current?.clear();
        onChange?.('');
      },
    }));

    const handleChange = (text) => {
      const sanitized = sanitizeValue(text, length, onlyDigits);
      if (!controlled) {
        setInternalValue(sanitized);
      }
      onChange?.(sanitized);
    };

    const focusInput = () => {
      if (editable) {
        inputRef.current?.focus();
      }
    };

    const activeIndex =
      currentValue.length === length ? length - 1 : currentValue.length;

    const slots = useMemo(
      () =>
        Array.from({ length }, (_, index) => {
          const char = currentValue[index] ?? '';
          const isActive = isFocused && index === activeIndex;
          const hasFakeCaret =
            isFocused &&
            ((currentValue.length < length && index === currentValue.length) ||
              (currentValue.length === length && index === length - 1));

          return {
            char,
            isActive,
            hasFakeCaret,
            index,
          };
        }),
      [length, currentValue, isFocused, activeIndex],
    );

    const contextValue = useMemo(
      () => ({
        value: currentValue,
        length,
        slots,
        focus: focusInput,
        editable,
      }),
      [currentValue, length, slots, editable],
    );

    return (
      <InputOTPContext.Provider value={contextValue}>
        <View style={[styles.container, containerStyle]}>
          <TextInput
            ref={inputRef}
            style={[styles.hiddenInput, inputStyle]}
            value={currentValue}
            onChangeText={handleChange}
            keyboardType={onlyDigits ? 'number-pad' : 'default'}
            maxLength={length}
            autoFocus={autoFocus}
            caretHidden
            editable={editable}
            selectionColor="transparent"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          <Pressable style={[styles.stack, style]} onPress={focusInput}>
            {contextValue.slots.map((slot) => (
              <View
                key={slot.index}
                style={[
                  styles.slot,
                  slot.isActive && styles.slotActive,
                  !editable && styles.slotDisabled,
                ]}
              >
                <Text style={styles.slotText}>{slot.char}</Text>
                {slot.hasFakeCaret && (
                  <View style={styles.caretWrapper}>
                    <View style={styles.caret} />
                  </View>
                )}
              </View>
            ))}
          </Pressable>
        </View>
      </InputOTPContext.Provider>
    );
  },
);

InputOTP.displayName = 'InputOTP';

const InputOTPGroup = forwardRef(({ children, style, ...props }, ref) => (
  <View ref={ref} style={[styles.group, style]} {...props}>
    {children}
  </View>
));

InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = forwardRef(({ index, style, textStyle, ...props }, ref) => {
  const { slots, focus, editable } = useInputOTPContext();
  const slot = slots[index];

  if (!slot) {
    throw new Error(`InputOTPSlot index ${index} is out of bounds`);
  }

  return (
    <Pressable
      ref={ref}
      onPress={focus}
      disabled={!editable}
      style={({ pressed }) => [
        styles.slot,
        slot.isActive && styles.slotActive,
        pressed && editable && styles.slotPressed,
        !editable && styles.slotDisabled,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.slotText, textStyle]}>{slot.char}</Text>
      {slot.hasFakeCaret && (
        <View style={styles.caretWrapper}>
          <View style={styles.caret} />
        </View>
      )}
    </Pressable>
  );
});

InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = forwardRef(({ style, iconColor = '#71717a', ...props }, ref) => (
  <View ref={ref} style={[styles.separator, style]} {...props}>
    <Dot size={16} color={iconColor} />
  </View>
));

InputOTPSeparator.displayName = 'InputOTPSeparator';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
    zIndex: -1,
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slot: {
    width: 44,
    height: 50,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(113, 113, 122, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  slotActive: {
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  slotPressed: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  slotDisabled: {
    opacity: 0.5,
  },
  slotText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  caretWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caret: {
    width: 2,
    height: 20,
    backgroundColor: '#f8fafc',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };

