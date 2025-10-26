import Slider from '@react-native-community/slider';
import { Radius } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RadiusButton = ({ radius, setRadius }) => {
  const [sliderValue, setSliderValue] = useState(radius);
  const [modalVisible, setModalVisible] = useState(false);
  
  const handleSliderChange = (value) => {
    setSliderValue(value);
  };
  
  const applyRadius = () => {
    setRadius(sliderValue);
    setModalVisible(false);
  };

  const openModal = () => {
    setSliderValue(radius);
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity 
        onPress={openModal}
        style={styles.button}
      >
        <Radius size={20} color="#a1a1aa" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Set Search Radius</Text>
            
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabels}>
                <Text style={styles.label}>1 mile</Text>
                <Text style={styles.currentValue}>{sliderValue} miles</Text>
                <Text style={styles.label}>5 miles</Text>
              </View>
              
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={sliderValue}
                onValueChange={handleSliderChange}
                minimumTrackTintColor="#6366f1" // music-primary
                maximumTrackTintColor="#3f3f46" // zinc-700
                thumbStyle={styles.sliderThumb}
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={applyRadius}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3f3f46', // zinc-700
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#18181b', // zinc-900
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#27272a', // zinc-800
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#a1a1aa', // zinc-400
  },
  currentValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1', // music-primary
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#6366f1', // music-primary
    width: 20,
    height: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
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
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#6366f1', // music-primary
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RadiusButton;
