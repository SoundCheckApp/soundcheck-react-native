import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MusicianBio = ({ bio }) => {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 100;
  const isTooLong = bio?.length > maxLength;
  
  const displayBio = expanded || !isTooLong 
    ? bio 
    : `${bio?.substring(0, maxLength)}...`;
  
  return (
    <View className="w-full max-w-md" style={styles.container}>
      <Text className="text-zinc-300 text-center" style={styles.bioText}>
        {displayBio}
      </Text>
      
      {isTooLong && (
        <TouchableOpacity 
          className="text-purple-400 p-0 h-auto text-sm mt-1"
          onPress={() => setExpanded(!expanded)}
          style={styles.toggleButton}
        >
          <Text className="text-purple-400 text-sm" style={styles.toggleText}>
            {expanded ? "Show Less" : "Read More"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 448, // max-w-md
    alignItems: 'center',
  },
  bioText: {
    color: '#a1a1aa', // zinc-300
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  toggleButton: {
    padding: 0,
    marginTop: 4,
  },
  toggleText: {
    color: '#c084fc', // purple-400
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MusicianBio;
