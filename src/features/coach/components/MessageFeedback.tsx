import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { UserFeedback } from '../types';

interface MessageFeedbackProps {
  feedback?: UserFeedback;
  onFeedback: (rating: 'helpful' | 'not_helpful') => void;
}

export function MessageFeedback({ feedback, onFeedback }: MessageFeedbackProps) {
  if (feedback) {
    return (
      <View style={styles.container}>
        <Ionicons
          name={feedback.rating === 'helpful' ? 'thumbs-up' : 'thumbs-down'}
          size={14}
          color="#6B7280"
        />
        <Text style={styles.thankYou}>Merci</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onFeedback('helpful')}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        hitSlop={12}
      >
        <Ionicons name="thumbs-up-outline" size={16} color="#6B7280" />
      </Pressable>
      <View style={styles.divider} />
      <Pressable
        onPress={() => onFeedback('not_helpful')}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        hitSlop={12}
      >
        <Ionicons name="thumbs-down-outline" size={16} color="#6B7280" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginLeft: 4,
    opacity: 0.7,
  },
  button: {
    padding: 4,
  },
  pressed: {
    opacity: 0.5,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  thankYou: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
});
