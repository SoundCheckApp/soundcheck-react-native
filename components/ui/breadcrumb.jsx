import { ChevronRight, MoreHorizontal } from 'lucide-react-native';
import React, { createContext, forwardRef, useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const BreadcrumbContext = createContext({
  separator: <ChevronRight size={14} color="#a1a1aa" />,
});

const Breadcrumb = forwardRef(
  ({ children, separator, style, ...props }, ref) => (
    <BreadcrumbContext.Provider
      value={{
        separator:
          separator ?? <ChevronRight size={14} color="#a1a1aa" />,
      }}
    >
      <View
        ref={ref}
        accessibilityRole="navigation"
        style={style}
        {...props}
      >
        {children}
      </View>
    </BreadcrumbContext.Provider>
  ),
);

Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = forwardRef(({ children, style, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.list, style]}
    {...props}
  >
    {children}
  </View>
));

BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = forwardRef(({ children, style, ...props }, ref) => (
  <View ref={ref} style={[styles.item, style]} {...props}>
    {children}
  </View>
));

BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = forwardRef(
  ({ children, onPress, style, ...props }, ref) => (
    <Pressable
      ref={ref}
      style={({ pressed }) => [
        styles.link,
        style,
        pressed && styles.linkPressed,
      ]}
      onPress={onPress}
      accessibilityRole="link"
      {...props}
    >
      <Text style={styles.linkText}>{children}</Text>
    </Pressable>
  ),
);

BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = forwardRef(({ children, style, ...props }, ref) => (
  <Text
    ref={ref}
    accessibilityRole="text"
    aria-current="page"
    style={[styles.page, style]}
    {...props}
  >
    {children}
  </Text>
));

BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({ children, style, ...props }) => {
  const { separator } = useContext(BreadcrumbContext);

  return (
    <View style={[styles.separator, style]} {...props}>
      {children ?? separator}
    </View>
  );
};

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({ style, iconColor = '#a1a1aa', ...props }) => (
  <View
    accessibilityRole="text"
    style={[styles.ellipsis, style]}
    {...props}
  >
    <MoreHorizontal size={16} color={iconColor} />
    <Text style={styles.srText}>More</Text>
  </View>
);

BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  link: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  linkPressed: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  linkText: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  page: {
    fontSize: 14,
    color: '#f5f5f5',
  },
  separator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  ellipsis: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  srText: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
});

export {
    Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem,
    BreadcrumbLink, BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
};

