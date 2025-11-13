import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

const paginationButtonVariants = ({ isActive, size = 'icon' } = {}) => {
  const sizes = {
    icon: {
      width: 36,
      height: 36,
      paddingHorizontal: 0,
    },
    default: {
      minWidth: 80,
      height: 40,
      paddingHorizontal: 12,
    },
  };

  const selectedSize = sizes[size] || sizes.icon;

  return [
    styles.linkButton,
    selectedSize,
    isActive && styles.linkButtonActive,
  ];
};

export const Pagination = ({ style, children, ...props }) => (
  <View
    role="navigation"
    accessibilityLabel="pagination"
    style={[styles.container, style]}
    {...props}
  >
    {children}
  </View>
);

Pagination.displayName = 'Pagination';

export const PaginationContent = React.forwardRef(
  ({ style, children, ...props }, ref) => (
    <View ref={ref} style={[styles.content, style]} {...props}>
      {children}
    </View>
  ),
);

PaginationContent.displayName = 'PaginationContent';

export const PaginationItem = React.forwardRef(
  ({ style, children, ...props }, ref) => (
    <View ref={ref} style={[styles.item, style]} {...props}>
      {children}
    </View>
  ),
);

PaginationItem.displayName = 'PaginationItem';

export const PaginationLink = ({
  isActive = false,
  size = 'icon',
  children,
  style,
  onPress,
  disabled = false,
  ...props
}) => (
  <Button
    variant={isActive ? 'outline' : 'ghost'}
    size={size}
    onPress={onPress}
    disabled={disabled}
    style={[paginationButtonVariants({ isActive, size }), style]}
    {...props}
  >
    <Text style={[styles.linkText, isActive && styles.linkTextActive]}>
      {children}
    </Text>
  </Button>
);

PaginationLink.displayName = 'PaginationLink';

export const PaginationPrevious = ({ style, onPress, ...props }) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    style={[styles.previousNext, style]}
    onPress={onPress}
    {...props}
  >
    <ChevronLeft size={16} color="#e4e4e7" />
    <Text style={styles.previousNextText}>Previous</Text>
  </PaginationLink>
);

PaginationPrevious.displayName = 'PaginationPrevious';

export const PaginationNext = ({ style, onPress, ...props }) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    style={[styles.previousNext, style]}
    onPress={onPress}
    {...props}
  >
    <Text style={styles.previousNextText}>Next</Text>
    <ChevronRight size={16} color="#e4e4e7" />
  </PaginationLink>
);

PaginationNext.displayName = 'PaginationNext';

export const PaginationEllipsis = ({ style, ...props }) => (
  <View
    accessibilityElementsHidden
    style={[styles.ellipsis, style]}
    {...props}
  >
    <MoreHorizontal size={18} color="#a1a1aa" />
    <Text style={styles.srOnly}>More pages</Text>
  </View>
);

PaginationEllipsis.displayName = 'PaginationEllipsis';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  item: {
    flexDirection: 'row',
  },
  linkButton: {
    borderRadius: 10,
    borderColor: 'rgba(63, 63, 70, 0.6)',
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderColor: '#6366f1',
  },
  linkText: {
    color: '#cbd5f5',
    fontSize: 14,
    fontWeight: '500',
  },
  linkTextActive: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  previousNext: {
    flexDirection: 'row',
    gap: 8,
  },
  previousNextText: {
    color: '#e4e4e7',
    fontSize: 14,
    fontWeight: '600',
  },
  ellipsis: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  srOnly: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});

