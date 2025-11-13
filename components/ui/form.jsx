import React, {
    createContext,
    forwardRef,
    useContext,
    useId,
    useMemo,
} from 'react';
import {
    Controller,
    FormProvider,
    useFormContext,
} from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Label } from '@/components/ui/label';

const Form = FormProvider;

const FormFieldContext = createContext(null);
const FormItemContext = createContext(null);

const FormField = ({ name, rules, defaultValue, control, render }) => {
  const fieldContextValue = useMemo(() => ({ name }), [name]);

  return (
    <FormFieldContext.Provider value={fieldContextValue}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue}
        render={render}
      />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const form = useFormContext();

  if (!fieldContext || !fieldContext.name) {
    throw new Error('useFormField should be used within <FormField>');
  }

  if (!itemContext || !itemContext.id) {
    throw new Error('useFormField should be used within <FormItem>');
  }

  const fieldState = form.getFieldState(fieldContext.name, form.formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

const FormItem = forwardRef(({ style, children, ...props }, ref) => {
  const id = useId();
  const contextValue = useMemo(() => ({ id }), [id]);

  return (
    <FormItemContext.Provider value={contextValue}>
      <View ref={ref} style={[styles.item, style]} {...props}>
        {children}
      </View>
    </FormItemContext.Provider>
  );
});

FormItem.displayName = 'FormItem';

const FormLabel = forwardRef(({ style, children, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      style={[error ? styles.labelError : null, style]}
      nativeID={formItemId}
      {...props}
    >
      {children}
    </Label>
  );
});

FormLabel.displayName = 'FormLabel';

const FormControl = forwardRef(({ children, ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  if (!children) {
    return null;
  }

  const child = React.Children.only(children);

  return React.cloneElement(child, {
    ref,
    nativeID: formItemId,
    accessibilityHint: child.props.accessibilityHint,
    accessibilityLabel: child.props.accessibilityLabel,
    accessibilityDescribedBy: error
      ? `${formDescriptionId} ${formMessageId}`
      : formDescriptionId,
    accessibilityState: {
      ...(child.props.accessibilityState || {}),
      invalid: !!error,
    },
    ...props,
  });
});

FormControl.displayName = 'FormControl';

const FormDescription = forwardRef(({ style, children, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <Text
      ref={ref}
      nativeID={formDescriptionId}
      style={[styles.description, style]}
      {...props}
    >
      {children}
    </Text>
  );
});

FormDescription.displayName = 'FormDescription';

const FormMessage = forwardRef(({ style, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error?.message ? String(error.message) : children;

  if (!body) {
    return null;
  }

  return (
    <Text
      ref={ref}
      nativeID={formMessageId}
      style={[styles.message, style]}
      {...props}
    >
      {body}
    </Text>
  );
});

FormMessage.displayName = 'FormMessage';

const styles = StyleSheet.create({
  item: {
    gap: 8,
  },
  labelError: {
    color: '#ef4444',
  },
  description: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});

export {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    useFormField
};

