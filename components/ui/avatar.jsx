import React, { createContext, forwardRef, useContext, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const AvatarContext = createContext({
  showFallback: false,
  setShowFallback: () => {},
});

const useAvatarContext = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('Avatar compound components must be used within an Avatar.');
  }
  return context;
};

const Avatar = forwardRef(({ children, size = 40, style, ...props }, ref) => {
  const [showFallback, setShowFallback] = useState(false);
  const contextValue = useMemo(() => ({ showFallback, setShowFallback }), [showFallback]);

  return (
    <AvatarContext.Provider value={contextValue}>
      <View
        ref={ref}
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </AvatarContext.Provider>
  );
});

Avatar.displayName = 'Avatar';

const AvatarImage = forwardRef(({ source, style, resizeMode = 'cover', ...props }, ref) => {
  const { showFallback, setShowFallback } = useAvatarContext();

  if (!source || showFallback) {
    return null;
  }

  return (
    <Image
      ref={ref}
      source={source}
      resizeMode={resizeMode}
      onError={() => setShowFallback(true)}
      onLoad={() => setShowFallback(false)}
      style={[styles.image, style]}
      {...props}
    />
  );
});

AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = forwardRef(({ children, style, textStyle, ...props }, ref) => {
  const { showFallback, setShowFallback } = useAvatarContext();

  React.useEffect(() => {
    if (!children) {
      setShowFallback((prev) => prev);
    }
  }, [children, setShowFallback]);

  if (!showFallback) {
    return null;
  }

  return (
    <View ref={ref} style={[styles.fallback, style]} {...props}>
      {typeof children === 'string' ? (
        <Text style={[styles.fallbackText, textStyle]} numberOfLines={1}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
});

AvatarFallback.displayName = 'AvatarFallback';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#e4e4e7',
    fontWeight: '600',
    fontSize: 16,
  },
});

export { Avatar, AvatarFallback, AvatarImage };

