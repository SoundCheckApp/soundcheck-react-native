import React, { forwardRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export const Table = forwardRef(
  ({ style, contentContainerStyle, children, ...props }, ref) => (
    <ScrollView
      horizontal
      ref={ref}
      style={[styles.wrapper, style]}
      contentContainerStyle={[styles.table, contentContainerStyle]}
      {...props}
    >
      <View>{children}</View>
    </ScrollView>
  ),
);

Table.displayName = 'Table';

export const TableHeader = ({ style, children, ...props }) => (
  <View style={[styles.header, style]} {...props}>
    {children}
  </View>
);

TableHeader.displayName = 'TableHeader';

export const TableBody = ({ style, children, ...props }) => (
  <View style={[styles.body, style]} {...props}>
    {children}
  </View>
);

TableBody.displayName = 'TableBody';

export const TableFooter = ({ style, children, ...props }) => (
  <View style={[styles.footer, style]} {...props}>
    {children}
  </View>
);

TableFooter.displayName = 'TableFooter';

export const TableRow = ({ style, children, ...props }) => (
  <View style={[styles.row, style]} {...props}>
    {children}
  </View>
);

TableRow.displayName = 'TableRow';

export const TableHead = ({ style, children, ...props }) => (
  <Text style={[styles.headCell, style]} {...props}>
    {children}
  </Text>
);

TableHead.displayName = 'TableHead';

export const TableCell = ({ style, children, ...props }) => (
  <Text style={[styles.cell, style]} {...props}>
    {children}
  </Text>
);

TableCell.displayName = 'TableCell';

export const TableCaption = ({ style, children, ...props }) => (
  <Text style={[styles.caption, style]} {...props}>
    {children}
  </Text>
);

TableCaption.displayName = 'TableCaption';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  table: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.6)',
    backgroundColor: 'rgba(24, 24, 35, 0.9)',
  },
  body: {
    flexDirection: 'column',
  },
  footer: {
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.6)',
    backgroundColor: 'rgba(63,63,70,0.15)',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.4)',
    alignItems: 'center',
  },
  headCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1aa',
  },
  cell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#e5e7eb',
  },
  caption: {
    marginTop: 12,
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'left',
  },
});

