/**
 * ChatInputBar Component
 * Fixed bottom input bar with attachment button and send functionality
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    TextInput,
    View
} from 'react-native';

interface ChatInputBarProps {
  onSend: (message: string) => void;
  onAttach: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInputBar({ onSend, onAttach, isLoading, placeholder }: ChatInputBarProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
  };

  const canSend = text.trim().length > 0 && !isLoading;

  return (
    <View style={styles.container}>
      {/* Attachment button */}
      <Pressable onPress={onAttach} style={styles.attachButton} disabled={isLoading}>
        <View style={styles.attachButtonInner}>
          <Ionicons name="add" size={24} color="#8B5CF6" />
        </View>
      </Pressable>

      {/* Input field */}
      <View style={styles.inputWrapper}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder || t('coach.input.placeholder', 'Écris un message...')}
          placeholderTextColor="#6B7280"
          multiline
          maxLength={1000}
          style={styles.input}
          editable={!isLoading}
        />
      </View>

      {/* Send button */}
      <Pressable onPress={handleSend} disabled={!canSend} style={styles.sendButton}>
        <LinearGradient
          colors={canSend ? ['#8B5CF6', '#6366F1'] : ['#374151', '#1F2937']}
          style={styles.sendButtonGradient}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="arrow-up" size={22} color={canSend ? 'white' : '#6B7280'} />
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: '#0F0F1A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  attachButton: {
    marginBottom: 4,
  },
  attachButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 100,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'center',
  },
  sendButton: {
    marginBottom: 4,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
