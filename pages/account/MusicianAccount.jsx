import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Eye, LogOut } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MUSICIAN_PROFILE_ROUTE = 'MusicianProfile';
const MUSICIAN_HOME_ROUTE = 'MusicianHome';
const LOGIN_ROUTE = 'Login';

const formatDate = (value) => {
  if (!value) return 'Not specified';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 'Not specified';
  return date.toLocaleDateString();
};

const calculateAge = (birthDateString) => {
  if (!birthDateString) return null;
  const birthDate = new Date(birthDateString);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

const MusicianAccount = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [musicianData, setMusicianData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [username, setUsername] = useState('');
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState('');
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState('');

  const age = useMemo(() => calculateAge(birthday), [birthday]);

  useEffect(() => {
    const load = async () => {
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
        const { data: musician, error: musicianError } = await supabase
          .from('musicians')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (musicianError) {
          toast.error('Error', 'Could not fetch your musician profile');
          setIsLoading(false);
          return;
        }

        if (musician) {
          setMusicianData(musician);
          setFirstName(musician.first_name ?? '');
          setLastName(musician.last_name ?? '');
          setLocation(musician.location ?? '');
          setUsername(musician.username ?? '');
          setArtistName(musician.artist_name ?? '');
          setBio(musician.bio ?? '');
          setBirthday(musician.birthday ?? '');
          setGenre(musician.genre ?? '');
          setEmail(session.user.email ?? '');
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

    load();
  }, []);

  const uploadPhoto = async (file) => {
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

      let uploadBody = file;

      if (uri) {
        const response = await fetch(uri);
        const blob = await response.blob();
        uploadBody = blob;
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, uploadBody, {
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

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.navigate(LOGIN_ROUTE);
    } catch (err) {
      toast.error('Error', err?.message ?? 'An error occurred while logging out');
    }
  };

  const save = async () => {
    if (!musicianData) return;

    try {
      const { error } = await supabase
        .from('musicians')
        .update({
          first_name: firstName,
          last_name: lastName,
          email,
          location,
          username,
          artist_name: artistName,
          bio,
        })
        .eq('id', musicianData.id);

      if (error) {
        throw error;
      }

      toast.success('Success', 'Your profile has been updated');
    } catch (err) {
      toast.error('Error', err?.message ?? 'An error occurred while saving your profile');
    }
  };

  const previewProfile = () => {
    if (currentUser) {
      navigation.navigate(MUSICIAN_PROFILE_ROUTE, { id: currentUser.id });
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
          <Button onPress={() => navigation.navigate(LOGIN_ROUTE)} style={styles.primaryButton} textStyle={styles.primaryButtonText}>
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
          onPress={() => navigation.navigate(MUSICIAN_HOME_ROUTE)}
        >
          <ArrowLeft size={20} color="#a1a1aa" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PhotoUpload onPhotoUpload={uploadPhoto} currentPhotoUrl={profileData?.avatar_url} />

        <View style={styles.formSection}>
          <View style={styles.twoColumn}>
            <View style={styles.field}>
              <Label>First Name</Label>
              <Input value={firstName} editable={false} style={styles.inputDisabled} />
            </View>
            <View style={styles.field}>
              <Label>Last Name</Label>
              <Input value={lastName} editable={false} style={styles.inputDisabled} />
            </View>
          </View>

          <View style={styles.field}>
            <Label>Email</Label>
            <Input value={email} onChangeText={setEmail} style={styles.input} />
          </View>

          <View style={styles.field}>
            <Label>Username</Label>
            <Input value={username} onChangeText={setUsername} style={styles.input} />
          </View>

          <View style={styles.field}>
            <Label>Artist Name</Label>
            <Input value={artistName} onChangeText={setArtistName} style={styles.input} />
          </View>

          <View style={styles.field}>
            <Label>Location</Label>
            <Input value={location} onChangeText={setLocation} style={styles.input} />
          </View>

          <View style={styles.field}>
            <Label>Genre</Label>
            <Input value={genre || 'Not specified'} editable={false} style={styles.inputDisabled} />
          </View>

          <View style={styles.field}>
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChangeText={setBio}
              style={styles.textarea}
              placeholder="Tell fans about your music..."
            />
          </View>

          <View style={styles.readOnlySection}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <View style={styles.twoColumn}>
              <View style={styles.field}>
                <Label>Birthday</Label>
                <Input value={formatDate(birthday)} editable={false} style={styles.inputDisabled} />
              </View>
              <View style={styles.field}>
                <Label>Age</Label>
                <Input value={age !== null ? age.toString() : 'Not specified'} editable={false} style={styles.inputDisabled} />
              </View>
            </View>
            <Text style={styles.helperText}>These fields cannot be changed</Text>
          </View>
        </View>

        <Button onPress={save} style={styles.saveButton} textStyle={styles.saveButtonText}>
          Save Changes
        </Button>

        <Button
          onPress={previewProfile}
          variant="outline"
          style={styles.previewButton}
          textStyle={styles.previewButtonText}
        >
          <Eye size={16} color="#38bdf8" style={styles.previewIcon} />
          Preview Artist Profile
        </Button>

        <Button
          onPress={logout}
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
    gap: 12,
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
  primaryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.5)',
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
  formSection: {
    gap: 16,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
    gap: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    color: '#000',
  },
  inputDisabled: {
    backgroundColor: 'rgba(148,163,184,0.3)',
    color: '#64748b',
  },
  textarea: {
    backgroundColor: '#ffffff',
    color: '#000',
    minHeight: 120,
  },
  readOnlySection: {
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.4)',
    gap: 12,
  },
  sectionTitle: {
    color: '#f4f4f5',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    color: '#71717a',
    fontSize: 11,
  },
  saveButton: {
    backgroundColor: '#f4f4f5',
  },
  saveButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  previewButton: {
    borderColor: '#38bdf8',
    backgroundColor: 'transparent',
  },
  previewButtonText: {
    color: '#38bdf8',
  },
  previewIcon: {
    marginRight: 8,
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

export default MusicianAccount;

