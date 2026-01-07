/**
 * ChunkReplyButton Component
 * Small button to reply to a specific section of AI analysis
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

interface ChunkReplyButtonProps {
  chunkContent: string;
  onReply: (content: string) => void;
}

export function ChunkReplyButton({ chunkContent, onReply }: ChunkReplyButtonProps) {
  const { t } = useTranslation();

  const handlePress = () => {
    // Truncate content for context (max 100 chars)
    const truncatedContent = chunkContent.length > 100
      ? chunkContent.slice(0, 100) + '...'
      : chunkContent;

    onReply(truncatedContent);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="chatbubble-ellipses-outline" size={12} color="#A78BFA" />
      <Text style={styles.buttonText}>
        {t('coach.replyToThis', 'Répondre')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  buttonText: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '500',
  },
});
