import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { z } from 'zod';

import AccountNavBar from '@/components/AccountNavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ResetPassword() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      toast.success('Password Updated', 'Your password has been successfully updated.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(
        'Password Reset Failed',
        error.message ?? 'An unexpected error occurred. The reset link may have expired.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrapper}>
          <Card style={styles.card}>
            <CardHeader style={styles.header}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Enter and confirm your new password</Text>
            </CardHeader>
            <CardContent style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter new password"
                      secureTextEntry
                    />
                  )}
                />
                {errors.password ? (
                  <Text style={styles.error}>{errors.password.message}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Confirm new password"
                      secureTextEntry
                    />
                  )}
                />
                {errors.confirmPassword ? (
                  <Text style={styles.error}>{errors.confirmPassword.message}</Text>
                ) : null}
              </View>

              <Button onPress={handleSubmit(onSubmit)} disabled={isLoading}>
                {isLoading ? 'Updating Password...' : 'RESET PASSWORD'}
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      <AccountNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 120,
  },
  logoWrapper: {
    alignItems: 'center',
    gap: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#18181b',
    borderColor: 'rgba(63,63,70,0.5)',
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#f4f4f5',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 13,
  },
  error: {
    color: '#f87171',
    fontSize: 12,
  },
});

