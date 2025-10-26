import { DollarSign, X } from "lucide-react-native";
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from "../integrations/supabase/client";
import { createTipSession } from "../supabase/create-tip-session";

/**
 * TipButton Component
 * 
 * Allows users to send monetary tips to musicians using Stripe payment processing.
 * 
 * DEVELOPER NOTES:
 * 1. Ensure STRIPE_SECRET_KEY is set in Supabase Edge Function secrets
 * 2. Create a tip-success page to handle successful payments
 * 3. Consider implementing Stripe webhooks for production use
 */
const TipButton = ({ musicianName, musicianId }) => {
  const [tipAmount, setTipAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  /**
   * Handles custom amount input changes
   * Restricts input to numbers and limits to max $100
   */
  const handleCustomAmountChange = (text) => {
    // Allow only numbers and limit to 3 digits (max $100)
    const value = text.replace(/[^0-9]/g, '');
    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 100)) {
      setCustomAmount(value);
      setTipAmount(value ? parseInt(value) : null);
    }
  };

  /**
   * Records the tip in the musician_earnings table
   * This would typically be called after successful Stripe payment
   */
  const recordTipEarning = async (amount, tipId) => {
    try {
      const { error } = await supabase
        .from('musician_earnings')
        .insert({
          musician_id: musicianId,
          amount: amount,
          source_type: 'tip',
          source_id: tipId,
          description: `Tip from fan`
        });

      if (error) {
        console.error('Error recording tip earning:', error);
      }
    } catch (error) {
      console.error('Error recording tip earning:', error);
    }
  };

  /**
   * Processes the tip transaction via Stripe
   * 
   * DEVELOPER NOTE: For production use, consider:
   * 1. Adding user authentication verification before allowing tips
   * 2. Storing tip history in Supabase database
   * 3. Implementing receipt emails for tippers
   */
  const handleTip = async () => {
    if (!tipAmount) return;
    
    setIsProcessing(true);
    
    try {
      // Use the tip session service we created earlier
      const result = await createTipSession({
        amount: tipAmount,
        musicianId,
        musicianName,
        consumerId: 'current-user-id' // You'll need to get this from auth
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // For demo purposes, record the tip earning immediately
      // In production, this should be handled by Stripe webhooks after successful payment
      await recordTipEarning(tipAmount, result.data.id);
      
      Alert.alert(
        'Tip Sent!',
        `Your $${tipAmount} tip to ${musicianName} has been processed successfully.`,
        [{ text: 'OK', onPress: handleClose }]
      );
      
    } catch (error) {
      console.error('Error creating tip session:', error);
      Alert.alert(
        'Tip Error',
        'There was a problem processing your tip. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCustomAmount('');
    setTipAmount(null);
  };
  
  return (
    <>
      <TouchableOpacity 
        style={styles.tipButton}
        onPress={() => setIsOpen(true)}
      >
        <DollarSign size={16} color="#000000" />
        <Text style={styles.tipButtonText}>Tip</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isOpen}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Send a Tip to {musicianName}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.content}>
              <Text style={styles.description}>
                Enter an amount between $1 and $100 to send a tip to {musicianName}
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.input}
                  value={customAmount}
                  onChangeText={handleCustomAmountChange}
                  placeholder="$1-$100"
                  placeholderTextColor="#71717a"
                  keyboardType="numeric"
                  maxLength={3}
                  autoFocus
                />
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  (!tipAmount || isProcessing) && styles.submitButtonDisabled
                ]}
                onPress={handleTip}
                disabled={!tipAmount || isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Send Tip</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    backgroundColor: 'transparent',
  },
  tipButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#27272a', // zinc-800
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#3f3f46', // zinc-700
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f46', // zinc-700
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#a1a1aa', // zinc-400
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dollarSign: {
    fontSize: 18,
    color: '#ffffff',
    marginRight: 8,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    backgroundColor: '#3f3f46', // zinc-700
    borderWidth: 1,
    borderColor: '#52525b', // zinc-600
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6366f1', // music-primary
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  submitButtonDisabled: {
    backgroundColor: '#3f3f46', // zinc-700
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TipButton;
