import * as ImagePicker from 'expo-image-picker';
import { Camera } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PhotoUpload = ({ onPhotoUpload, currentPhotoUrl }) => {
  const [previewUrl, setPreviewUrl] = useState(currentPhotoUrl || null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
      return false;
    }
    return true;
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Photo Library', onPress: openImageLibrary },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPreviewUrl(asset.uri);
      onPhotoUpload(asset);
    }
  };

  const openImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPreviewUrl(asset.uri);
      onPhotoUpload(asset);
    }
  };

  const displayImage = previewUrl || currentPhotoUrl;

  return (
    <View className="flex flex-col items-center mb-6" style={styles.container}>
      <TouchableOpacity 
        onPress={handleImagePicker}
        style={styles.imageContainer}
      >
        <View className={`w-24 h-24 rounded-full flex items-center justify-center bg-zinc-800 border-2 border-zinc-700 ${displayImage ? 'overflow-hidden' : ''}`} style={styles.imageWrapper}>
          {displayImage ? (
            <Image 
              source={{ uri: displayImage }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Camera size={32} color="#a1a1aa" />
          )}
        </View>
      </TouchableOpacity>
      <Text className="mt-2 text-sm text-zinc-400" style={styles.instructionText}>
        {displayImage ? "Change Profile Photo" : "Upload Profile Photo"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
  },
  imageWrapper: {
    width: 96, // w-24
    height: 96, // h-24
    borderRadius: 48, // rounded-full
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27272a', // zinc-800
    borderWidth: 2,
    borderColor: '#3f3f46', // zinc-700
  },
  image: {
    width: '100%',
    height: '100%',
  },
  instructionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#a1a1aa', // zinc-400
    textAlign: 'center',
  },
});

export default PhotoUpload;
