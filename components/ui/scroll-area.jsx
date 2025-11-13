import React, { forwardRef } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

export const ScrollArea = forwardRef(
  (
    {
      style,
      contentContainerStyle,
      horizontal = false,
      showsVerticalScrollIndicator = false,
      showsHorizontalScrollIndicator = false,
      children,
      ...props
    },
    ref,
  ) => (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={ref}
        horizontal={horizontal}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        contentContainerStyle={[
          horizontal ? styles.horizontalContent : styles.verticalContent,
          contentContainerStyle,
        ]}
        {...props}
      >
        {children}
      </ScrollView>
    </View>
  ),
);

ScrollArea.displayName = 'ScrollArea';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    flex: 1,
  },
  verticalContent: {
    paddingVertical: 4,
  },
  horizontalContent: {
    paddingHorizontal: 4,
  },
});

