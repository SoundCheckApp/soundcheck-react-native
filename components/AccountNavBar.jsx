import { useNavigation, useRoute } from '@react-navigation/native';
import { BarChart2, Calendar, House, Settings } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AccountNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Check if we're in musician mode vs consumer mode based on current route
  const isMusicianMode = route.name?.startsWith('Musician') || 
                        route.name?.includes('Musician') ||
                        route.params?.mode === 'musician';
  
  const isConsumerMode = route.name?.startsWith('Consumer') || 
                        route.name?.includes('Consumer') ||
                        route.params?.mode === 'consumer';

  // Handle navigation
  const handleNavigation = async (screenName, params = {}) => {
    try {
      navigation.navigate(screenName, params);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };
  
  // Determine the correct homepage based on context
  const getHomepageScreen = () => {
    if (isConsumerMode) {
      return 'ConsumerHome';
    } else if (isMusicianMode) {
      return 'MusicianHome';
    } else {
      // Default fallback
      return 'ConsumerHome';
    }
  };
  
  const NavItem = ({ icon: Icon, label, onPress, isActive = false }) => (
    <TouchableOpacity 
      className="flex flex-col items-center p-2"
      onPress={onPress}
      style={styles.navItem}
    >
      <Icon 
        size={24} 
        color={isActive ? '#ffffff' : '#a1a1aa'} 
      />
      <Text className="text-xs mt-1" style={[styles.navText, isActive && styles.activeText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 py-2 z-20" style={styles.container}>
      <View className="max-w-md mx-auto flex flex-row items-center justify-around" style={styles.navContainer}>
        <NavItem 
          icon={House}
          label="Homepage"
          onPress={() => handleNavigation(getHomepageScreen())}
        />
        
        <NavItem 
          icon={BarChart2}
          label="Insights"
          onPress={() => handleNavigation(isMusicianMode ? 'MusicianInsights' : 'ConsumerInsights')}
        />
        
        <NavItem 
          icon={Calendar}
          label="Events"
          onPress={() => handleNavigation(isMusicianMode ? 'MusicianEvents' : 'ConsumerEvents')}
        />
        
        <NavItem 
          icon={Settings}
          label="Settings"
          onPress={() => handleNavigation(isMusicianMode ? 'MusicianSettings' : 'ConsumerSettings')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#18181b', // zinc-900
    borderTopWidth: 1,
    borderTopColor: '#27272a', // zinc-800
    paddingVertical: 8,
    zIndex: 20,
  },
  navContainer: {
    maxWidth: 448, // max-w-md
    marginHorizontal: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#a1a1aa', // zinc-300
  },
  activeText: {
    color: '#ffffff',
  },
});

export default AccountNavBar;
