import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AccountNavBar from '../AccountNavBar';

/**
 * A layout component that ensures content is scrollable
 * and properly padded for the bottom navigation bar when present
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to be rendered inside the layout
 * @param {boolean} [props.showNavBar=true] - Whether to show the bottom navigation bar
 * @param {string} [props.className=""] - Additional styles for the main container
 * @param {string} [props.contentClassName=""] - Additional styles for the content area
 */
const ScrollableLayout = ({
  children,
  showNavBar = true,
  className = "",
  contentClassName = "",
}) => {
  return (
    <View style={[styles.container, className]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          showNavBar ? styles.contentWithNavBar : styles.contentWithoutNavBar,
          contentClassName
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {children}
      </ScrollView>
      
      {showNavBar && <AccountNavBar />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentWithNavBar: {
    paddingBottom: 128, // Extra padding for bottom navigation bar
  },
  contentWithoutNavBar: {
    paddingBottom: 24,
  },
});

export default ScrollableLayout;
