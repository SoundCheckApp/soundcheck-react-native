import { Star, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ReviewForm = ({ musicianId, onClose }) => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const handleSubmit = () => {
    if (!review.trim()) {
      Alert.alert('Error', 'Please write a review before submitting.');
      return;
    }
    
    // In a real app, this would submit to an API
    console.log({
      musicianId,
      review,
      rating,
      isAnonymous
    });
    
    Alert.alert(
      'Review Submitted',
      'Thank you for your feedback!',
      [{ text: 'OK', onPress: onClose }]
    );
  };
  
  const StarRating = ({ rating, onRatingChange }) => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          style={styles.starButton}
        >
          <Star 
            size={32} 
            color={rating >= star ? '#fbbf24' : '#71717a'} 
            fill={rating >= star ? '#fbbf24' : 'transparent'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const CustomCheckbox = ({ checked, onPress, label }) => (
    <TouchableOpacity 
      style={styles.checkboxContainer}
      onPress={onPress}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Write a Review</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#a1a1aa" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Rating</Text>
          <StarRating rating={rating} onRatingChange={setRating} />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Your Review</Text>
          <TextInput
            style={styles.textArea}
            value={review}
            onChangeText={setReview}
            placeholder="Share your experience..."
            placeholderTextColor="#71717a"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.section}>
          <CustomCheckbox
            checked={isAnonymous}
            onPress={() => setIsAnonymous(!isAnonymous)}
            label="Submit anonymously"
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.submitButton, !review.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!review.trim()}
          >
            <Text style={styles.submitButtonText}>Submit Review</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b', // zinc-900
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a', // zinc-800
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#a1a1aa', // zinc-400
    marginBottom: 8,
    fontWeight: '500',
  },
  starContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  textArea: {
    backgroundColor: '#27272a', // zinc-800
    borderWidth: 1,
    borderColor: '#3f3f46', // zinc-700
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 100,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#a1a1aa', // zinc-400
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366f1', // music-primary
    borderColor: '#6366f1',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#a1a1aa', // zinc-400
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3f3f46', // zinc-700
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#a1a1aa', // zinc-400
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#6366f1', // music-primary
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#3f3f46', // zinc-700
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ReviewForm;
