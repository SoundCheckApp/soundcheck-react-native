import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { z } from 'zod';

import AccountNavBar from '@/components/AccountNavBar';
import PhotoUpload from '@/components/PhotoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { genreOptions } from '@/constants/formOptions';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculateAge } from '@/utils/dateUtils';

const consumerSignupSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  location: z.string().min(1, 'Location is required'),
  birthday: z.string().min(1, 'Birthday is required'),
  preferred_genre: z.string().min(1, 'Please select a genre'),
});

const ConsumerSignup = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { fromMusicianAccount = false, musicianData } = route.params ?? {};

  const [isLoading, setIsLoading] = useState(false);
  const [age, setAge] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const isAuthenticatedUser = useMemo(() => Boolean(fromMusicianAccount), [fromMusicianAccount]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(consumerSignupSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      username: '',
      location: '',
      birthday: '',
      preferred_genre: '',
    },
  });

  useEffect(() => {
    const populateFromMusician = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && isAuthenticatedUser && musicianData) {
        setValue('first_name', musicianData.firstName ?? '');
        setValue('last_name', musicianData.lastName ?? '');
        setValue('email', musicianData.email ?? '');
        setValue('location', musicianData.location ?? '');

        if (musicianData.birthday) {
          const birthday = new Date(musicianData.birthday);
          if (!Number.isNaN(birthday.getTime())) {
            const iso = birthday.toISOString().split('T')[0];
            setValue('birthday', iso);
            setAge(calculateAge(birthday));
          }
        }
      }
      setInitializing(false);
    };

    populateFromMusician();
  }, [isAuthenticatedUser, musicianData, setValue]);

  const watchedBirthday = watch('birthday');
  useEffect(() => {
    if (watchedBirthday) {
      const date = new Date(watchedBirthday);
      if (!Number.isNaN(date.getTime())) {
        setAge(calculateAge(date));
      } else {
        setAge(null);
      }
    }
  }, [watchedBirthday]);

  const handlePhotoUpload = (file) => {
    setUploadedPhoto(file);
  };

  const handleBack = () => {
    if (isAuthenticatedUser) {
      navigation.navigate('MusicianAccount');
    } else {
      navigation.goBack();
    }
  };

  const uploadPhotoIfNeeded = async (userId, email) => {
    if (!uploadedPhoto) return;

    try {
      const uri = uploadedPhoto.uri ?? uploadedPhoto.path;
      const name = uploadedPhoto.name ?? uploadedPhoto.fileName ?? `${userId}.jpg`;
      const extension = name.split('.').pop() || 'jpg';
      const fileName = `${userId}.${extension}`;
      const filePath = `avatars/${fileName}`;

      let body = uploadedPhoto;
      if (uri) {
        const response = await fetch(uri);
        body = await response.blob();
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, body, {
          upsert: true,
          contentType: uploadedPhoto.type || uploadedPhoto.mimeType || 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      await supabase
        .from('profiles')
        .upsert({ id: userId, email: email ?? '', avatar_url: data.publicUrl });
    } catch (err) {
      toast.error('Photo Upload', err?.message ?? 'Failed to upload photo');
    }
  };

  const submit = async (values) => {
    setIsLoading(true);
    const birthdayDate = new Date(values.birthday);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && isAuthenticatedUser) {
        const { error: profileError } = await supabase.from('consumers').insert({
          id: session.user.id,
          email: session.user.email ?? '',
          first_name: values.first_name,
          last_name: values.last_name,
          username: values.username,
          location: values.location,
          birthday: birthdayDate.toISOString().split('T')[0],
          age: age ?? 0,
          preferred_genre: values.preferred_genre,
        });

        if (profileError) throw profileError;

        await uploadPhotoIfNeeded(session.user.id, session.user.email);
        toast.success('Consumer profile created');
        navigation.navigate('ConsumerHome');
        return;
      }

      if (!values.password) {
        toast.error('Password required', 'Please enter a password to create your account.');
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.first_name,
            last_name: values.last_name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('consumers').insert({
          id: authData.user.id,
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          username: values.username,
          location: values.location,
          birthday: birthdayDate.toISOString().split('T')[0],
          age: age ?? 0,
          preferred_genre: values.preferred_genre,
        });

        if (profileError) throw profileError;

        await uploadPhotoIfNeeded(authData.user.id, values.email);

        toast.success('Account created successfully!', 'Please check your email to verify.');
        navigation.navigate('ConsumerHome');
      }
    } catch (err) {
      toast.error('Error creating account', err?.message ?? 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#f4f4f5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Button variant="ghost" size="sm" onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={18} color="#a1a1aa" />
            <Text style={styles.backText}>Back</Text>
          </Button>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Music Fan Profile</Text>
          <Text style={styles.subtitle}>
            {isAuthenticatedUser
              ? 'Complete your music consumer profile'
              : 'Create your music consumer profile'}
          </Text>
        </View>

        <PhotoUpload onPhotoUpload={handlePhotoUpload} />

        <View style={styles.formContainer}>
          <View style={styles.row}>
            <Controller
              control={control}
              name="first_name"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>First Name</Text>
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="John"
                    editable={!isAuthenticatedUser}
                  />
                  {errors.first_name ? (
                    <Text style={styles.errorText}>{errors.first_name.message}</Text>
                  ) : null}
                </View>
              )}
            />
            <Controller
              control={control}
              name="last_name"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Last Name</Text>
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="Doe"
                    editable={!isAuthenticatedUser}
                  />
                  {errors.last_name ? (
                    <Text style={styles.errorText}>{errors.last_name.message}</Text>
                  ) : null}
                </View>
              )}
            />
          </View>

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
                  editable={!isAuthenticatedUser}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                ) : null}
              </View>
            )}
          />

          {!isAuthenticatedUser ? (
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
          ) : null}

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="your_username"
                  autoCapitalize="none"
                />
                {errors.username ? (
                  <Text style={styles.errorText}>{errors.username.message}</Text>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="City, State"
                  editable={!isAuthenticatedUser}
                />
                {errors.location ? (
                  <Text style={styles.errorText}>{errors.location.message}</Text>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="birthday"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Birthday</Text>
                <Input
                  value={value}
                  onChangeText={(text) => onChange(text)}
                  placeholder="YYYY-MM-DD"
                  editable={!isAuthenticatedUser}
                />
                {errors.birthday ? (
                  <Text style={styles.errorText}>{errors.birthday.message}</Text>
                ) : null}
              </View>
            )}
          />

          {age !== null ? (
            <Text style={styles.helperText}>Age: {age} years old</Text>
          ) : null}

          <Controller
            control={control}
            name="preferred_genre"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Preferred Genre</Text>
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genreOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.preferred_genre ? (
                  <Text style={styles.errorText}>{errors.preferred_genre.message}</Text>
                ) : null}
              </View>
            )}
          />

          <Button onPress={handleSubmit(submit)} disabled={isLoading}>
            {isLoading
              ? 'Creating Account...'
              : isAuthenticatedUser
                ? 'Create Consumer Profile'
                : 'Submit'}
          </Button>
        </View>
      </ScrollView>

      <AccountNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b0b12',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#f4f4f5',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#a1a1aa',
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
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
  helperText: {
    color: '#a1a1aa',
    fontSize: 12,
  },
});

export default ConsumerSignup;

