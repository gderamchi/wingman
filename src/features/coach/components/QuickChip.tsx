/**
 * QuickChip Component
 * Quick-answer button for clarification questions
 */

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface QuickChipProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function QuickChip({ label, onPress, disabled }: QuickChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pressed: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: '#C084FC',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledLabel: {
    color: '#6B7280',
  },
});
