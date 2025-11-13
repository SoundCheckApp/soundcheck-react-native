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

const musicianSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  location: z.string().min(1, 'Location is required'),
  birthday: z.string().min(1, 'Birthday is required'),
  artistName: z.string().min(1, 'Artist name is required'),
  genre: z.string().min(1, 'Please select a genre'),
  bio: z.string().min(1, 'Please provide a bio').max(100, 'Bio must be 100 characters or less'),
});

const MusicianSignup = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(musicianSignupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      username: '',
      location: '',
      birthday: '',
      artistName: '',
      genre: '',
      bio: '',
    },
  });

  const handlePhotoUpload = (file) => {
    setUploadedPhoto(file);
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
        .upsert({ id: userId, email, avatar_url: data.publicUrl });
    } catch (err) {
      toast.error('Photo Upload', err?.message ?? 'Failed to upload photo');
    }
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const age = calculateAge(new Date(values.birthday));

        const { error: profileError } = await supabase.from('musicians').insert({
          id: authData.user.id,
          first_name: values.firstName,
          last_name: values.lastName,
          username: values.username,
          location: values.location,
          birthday: values.birthday,
          age,
          artist_name: values.artistName,
          genre: values.genre,
          bio: values.bio,
          email: values.email,
        });

        if (profileError) throw profileError;

        await uploadPhotoIfNeeded(authData.user.id, values.email);

        toast.success('Account created successfully!', 'Please check your email to verify your account.');
        navigation.navigate('MusicianHome');
      }
    } catch (err) {
      toast.error('Error creating account', err?.message ?? 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Musician Profile</Text>
          <Text style={styles.subtitle}>Create your musician profile</Text>
        </View>

        <PhotoUpload onPhotoUpload={handlePhotoUpload} />

        <View style={styles.form}>
          <View style={styles.row}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>First Name</Text>
                  <Input value={value} onChangeText={onChange} placeholder="John" />
                  {errors.firstName ? (
                    <Text style={styles.error}>{errors.firstName.message}</Text>
                  ) : null}
                </View>
              )}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Last Name</Text>
                  <Input value={value} onChangeText={onChange} placeholder="Doe" />
                  {errors.lastName ? (
                    <Text style={styles.error}>{errors.lastName.message}</Text>
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
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email ? <Text style={styles.error}>{errors.email.message}</Text> : null}
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
                  <Text style={styles.error}>{errors.password.message}</Text>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <Input value={value} onChangeText={onChange} placeholder="your_username" />
                {errors.username ? (
                  <Text style={styles.error}>{errors.username.message}</Text>
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
                <Input value={value} onChangeText={onChange} placeholder="City, State" />
                {errors.location ? (
                  <Text style={styles.error}>{errors.location.message}</Text>
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
                  onChangeText={onChange}
                  placeholder="YYYY-MM-DD"
                />
                {errors.birthday ? (
                  <Text style={styles.error}>{errors.birthday.message}</Text>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="artistName"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Artist Name</Text>
                <Input value={value} onChangeText={onChange} placeholder="Your stage name" />
                {errors.artistName ? (
                  <Text style={styles.error}>{errors.artistName.message}</Text>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="genre"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Genre</Text>
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {genreOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.genre ? <Text style={styles.error}>{errors.genre.message}</Text> : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="100 character limit"
                  maxLength={100}
                />
                {errors.bio ? <Text style={styles.error}>{errors.bio.message}</Text> : null}
              </View>
            )}
          />

          <Button onPress={handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'SUBMIT'}
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
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 20,
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
  },
  form: {
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
  error: {
    color: '#f87171',
    fontSize: 12,
  },
});

export default MusicianSignup;

