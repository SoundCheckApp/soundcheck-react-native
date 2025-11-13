import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { z } from 'zod';

import AccountNavBar from '@/components/AccountNavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: musicianData } = await supabase
          .from('musicians')
          .select('id')
          .eq('id', data.user.id)
          .single();

        const { data: consumerData } = await supabase
          .from('consumers')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (musicianData && consumerData) {
          navigation.navigate('MusicianHome');
        } else if (musicianData) {
          navigation.navigate('MusicianHome');
        } else if (consumerData) {
          navigation.navigate('ConsumerHome');
        } else {
          navigation.navigate('SelectAccountType');
        }
      }
    } catch (err) {
      toast.error('Login failed', err?.message ?? 'Unable to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.logoWrapper}>
          <Image
            source={{
              uri: 'https://cdn.builder.io/api/v1/image/assets/3628c6577eb34cf19edbf3167131a5d9/df4064c7c380b4bb0138a1edfaeaee073d637b89?placeholderIfAbsent=true',
            }}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="your.email@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="••••••••"
                  secureTextEntry
                />
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                ) : null}
              </View>
            )}
          />

          <Button onPress={handleSubmit(onSubmit)} disabled={isLoading} style={styles.submitButton}>
            {isLoading ? 'Signing In...' : 'SIGN IN'}
          </Button>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.link}>Forgot your password?</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SelectAccountType')}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <AccountNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 120,
    alignItems: 'center',
    gap: 16,
  },
  logoWrapper: {
    marginBottom: 16,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  title: {
    color: '#f4f4f5',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  form: {
    width: '100%',
    gap: 16,
    marginTop: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 13,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
  },
  submitButton: {
    marginTop: 8,
  },
  link: {
    color: '#60a5fa',
    fontSize: 14,
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  footerLink: {
    color: '#60a5fa',
    fontSize: 13,
  },
});

export default Login;

