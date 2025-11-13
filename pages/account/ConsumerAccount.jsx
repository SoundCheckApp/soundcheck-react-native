import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Eye, LogOut } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import AccountNavBar from '@/components/AccountNavBar';
import PhotoUpload from '@/components/PhotoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { genreOptions } from '@/constants/formOptions';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ConsumerAccount = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [consumerData, setConsumerData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [preferredGenre, setPreferredGenre] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsLoading(false);
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
      setCurrentUser(session.user);

      try {
        const { data: consumer, error } = await supabase
          .from('consumers')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          toast.error('Error', 'Could not fetch your consumer profile');
          setIsLoading(false);
          return;
        }

        if (consumer) {
          setConsumerData(consumer);
          setFirstName(consumer.first_name || '');
          setLastName(consumer.last_name || '');
          setUsername(consumer.username || '');
          setLocation(consumer.location || '');
          setPreferredGenre(consumer.preferred_genre || '');
          setBio(consumer.bio || '');
          setEmail(session.user.email || '');
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile && !profileError) {
          setProfileData(profile);
        }
      } catch (err) {
        toast.error('Unexpected error', err?.message ?? 'Please try again later');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handlePhotoUpload = async (file) => {
    if (!currentUser) {
      toast.error('Error', 'You must be logged in to upload a photo');
      return;
    }

    try {
      const uri = file?.uri ?? file?.path;
      let fileName = file?.name ?? file?.fileName ?? `${currentUser.id}.jpg`;
      const extension = fileName.split('.').pop() || 'jpg';
      fileName = `${currentUser.id}.${extension}`;
      const filePath = `avatars/${fileName}`;

      let fileBody = file;

      if (uri) {
        const response = await fetch(uri);
        const blob = await response.blob();
        fileBody = blob;
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileBody, {
          upsert: true,
          contentType: file?.type || file?.mimeType || 'image/jpeg',
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: currentUser.id,
          email: currentUser.email || email,
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

      if (profileError) {
        throw profileError;
      }

      setProfileData((prev) => ({
        ...prev,
        avatar_url: data.publicUrl,
        id: currentUser.id,
        email: currentUser.email || email,
        updated_at: new Date().toISOString(),
      }));

      toast.success('Success', 'Profile photo updated successfully');
    } catch (err) {
      toast.error('Error', err?.message ?? 'Failed to upload photo');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.navigate('Login');
    } catch (err) {
      toast.error('Error', err?.message ?? 'An error occurred while logging out');
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('Error', 'You must be logged in to save changes');
      return;
    }

    setIsSaving(true);

    try {
      const { data: updatedConsumer, error } = await supabase
        .from('consumers')
        .update({
          first_name: firstName,
          last_name: lastName,
          username,
          location,
          preferred_genre: preferredGenre,
          bio,
        })
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setConsumerData(updatedConsumer);
      toast.success('Success', 'Your profile has been updated successfully');
    } catch (err) {
      toast.error('Error', err?.message ?? 'An error occurred while saving your profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <ActivityIndicator size="small" color="#f4f4f5" />
        <Text style={styles.loadingText}>Loading account details...</Text>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>Account Access</Text>
          <Text style={styles.subtitle}>Please log in to access your account settings.</Text>
          <Button
            onPress={() => navigation.navigate('Login')}
            variant="secondary"
            style={styles.primaryButton}
          >
            Go to Login
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('ConsumerHome')}
        >
          <ArrowLeft size={20} color="#a1a1aa" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PhotoUpload onPhotoUpload={handlePhotoUpload} currentPhotoUrl={profileData?.avatar_url} />

        <Button
          variant="outline"
          onPress={() => navigation.navigate('ConsumerProfile', { id: currentUser?.id })}
          style={styles.previewButton}
          textStyle={styles.previewButtonText}
        >
          <Eye size={16} color="#a855f7" style={styles.previewIcon} />
          Preview Profile Page
        </Button>

        <View style={styles.formSection}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Label>First Name</Label>
              <Input
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                textContentType="givenName"
              />
            </View>
            <View style={styles.column}>
              <Label>Last Name</Label>
              <Input
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                textContentType="familyName"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Label>Email</Label>
            <Input value={email} editable={false} style={styles.inputDisabled} />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.field}>
            <Label>Username</Label>
            <Input value={username} onChangeText={setUsername} style={styles.input} />
          </View>

          <View style={styles.field}>
            <Label>Location</Label>
            <Input value={location} onChangeText={setLocation} style={styles.input} />
          </View>

          <View style={styles.field}>
            <Label>Preferred Genre</Label>
            <Select value={preferredGenre} onValueChange={setPreferredGenre}>
              <SelectTrigger style={styles.selectTrigger}>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent style={styles.selectContent}>
                {genreOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </View>

          <View style={styles.field}>
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChangeText={setBio}
              maxLength={25}
              style={styles.textarea}
            />
            <Text style={styles.helperText}>{bio.length}/25 characters</Text>
          </View>
        </View>

        <Button
          onPress={handleSave}
          disabled={isSaving}
          style={styles.saveButton}
          textStyle={styles.saveButtonText}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>

        <Button
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        >
          <LogOut size={16} color="#ef4444" style={styles.logoutIcon} />
          Logout
        </Button>
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
  fullScreen: {
    flex: 1,
    backgroundColor: '#0b0b12',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: '#f4f4f5',
    fontSize: 14,
  },
  centerContent: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  title: {
    color: '#f4f4f5',
    fontSize: 22,
    fontWeight: '600',
  },
  subtitle: {
    color: '#a1a1aa',
    fontSize: 14,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#f4f4f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  headerTitle: {
    color: '#f4f4f5',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 20,
  },
  previewButton: {
    borderColor: '#a855f7',
    backgroundColor: 'transparent',
  },
  previewButtonText: {
    color: '#a855f7',
    fontSize: 14,
  },
  previewIcon: {
    marginRight: 8,
  },
  formSection: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  field: {
    gap: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  inputDisabled: {
    backgroundColor: 'rgba(148,163,184,0.3)',
    color: '#64748b',
  },
  helperText: {
    fontSize: 11,
    color: '#71717a',
  },
  selectTrigger: {
    backgroundColor: '#ffffff',
  },
  selectContent: {
    backgroundColor: '#0f0f17',
  },
  textarea: {
    backgroundColor: '#ffffff',
    color: '#000000',
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: '#f4f4f5',
  },
  saveButtonText: {
    color: '#0b0b12',
    fontWeight: '600',
  },
  logoutButton: {
    borderColor: '#ef4444',
    backgroundColor: 'transparent',
  },
  logoutButtonText: {
    color: '#ef4444',
  },
  logoutIcon: {
    marginRight: 8,
  },
});

export default ConsumerAccount;

