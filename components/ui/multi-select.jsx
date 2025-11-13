import { Check, ChevronDown, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const MultiSelect = ({
  options = [],
  selected = [],
  onChange = () => {},
  placeholder = 'Select options',
  maxSelections = 3,
  style,
}) => {
  const [open, setOpen] = useState(false);

  const selectedArray = useMemo(() => {
    if (!selected) return [];
    if (Array.isArray(selected)) return selected;
    return [];
  }, [selected]);

  const handleToggle = (value) => {
    if (!onChange) return;

    const isSelected = selectedArray.includes(value);
    if (isSelected) {
      onChange(selectedArray.filter((item) => item !== value));
    } else if (selectedArray.length < maxSelections) {
      onChange([...selectedArray, value]);
    }
  };

  const handleRemove = (value) => {
    if (!onChange) return;
    onChange(selectedArray.filter((item) => item !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          style={[styles.triggerButton, style]}
        >
          <View style={styles.triggerContent}>
            {selectedArray.length > 0 ? (
              selectedArray.length <= 2 ? (
                <View style={styles.badgeContainer}>
                  {selectedArray.map((value) => {
                    const option = options.find((opt) => opt.value === value);
                    return (
                      <Badge
                        key={value}
                        variant="secondary"
                        containerStyle={styles.badge}
                      >
                        <View style={styles.badgeInner}>
                          <Text style={styles.badgeText}>
                            {option?.label || value}
                          </Text>
                          <TouchableOpacity
                            style={styles.badgeRemove}
                            onPress={() => handleRemove(value)}
                          >
                            <X size={14} color="#d4d4d8" />
                          </TouchableOpacity>
                        </View>
                      </Badge>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.counterText}>
                  {selectedArray.length} selected
                </Text>
              )
            ) : (
              <Text style={styles.placeholderText}>{placeholder}</Text>
            )}
          </View>
          <ChevronDown size={18} color="#a1a1aa" />
        </Button>
      </PopoverTrigger>
      <PopoverContent style={styles.popoverContent} align="start">
        <ScrollView style={styles.optionList}>
          {options.map((option) => {
            const isSelected = selectedArray.includes(option.value);
            const isDisabled =
              !isSelected && selectedArray.length >= maxSelections;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  isDisabled && styles.optionItemDisabled,
                ]}
                onPress={() => !isDisabled && handleToggle(option.value)}
                disabled={isDisabled}
              >
                <Checkbox
                  checked={isSelected}
                  style={styles.checkbox}
                />
                <Text style={styles.optionLabel}>{option.label}</Text>
                {isSelected && (
                  <Check size={18} color="#a1a1aa" style={styles.optionIcon} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </PopoverContent>
    </Popover>
  );
};

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0f0f23',
    borderColor: 'rgba(63,63,70,0.6)',
  },
  triggerContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  placeholderText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#3f3f46',
    borderColor: '#52525b',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    color: '#e4e4e7',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(63,63,70,0.6)',
  },
  counterText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  popoverContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#1f1f2e',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#3f3f46',
  },
  optionList: {
    maxHeight: 260,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  optionItemDisabled: {
    opacity: 0.4,
  },
  checkbox: {
    borderColor: '#52525b',
  },
  optionLabel: {
    color: '#d4d4d8',
    fontSize: 14,
    flex: 1,
  },
  optionIcon: {
    opacity: 0.7,
  },
});

