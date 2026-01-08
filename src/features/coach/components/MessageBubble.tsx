/**
 * MessageBubble Component
 * Displays a chat message bubble with support for user/coach styling and attachments
 */

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { CoachMessage, MessageAttachment } from '../types';
import { MarkdownText } from './MarkdownText';
import { MessageFeedback } from './MessageFeedback';

interface MessageBubbleProps {
  message: CoachMessage;
  onAttachmentPress?: (attachment: MessageAttachment) => void;
  onFeedback?: (rating: 'helpful' | 'not_helpful') => void;
}

export function MessageBubble({ message, onAttachmentPress, onFeedback }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const hasAttachments = message.attachments && message.attachments.length > 0;

  // Extract text content
  const textContent =
    typeof message.content === 'string'
      ? message.content
      : null; // Structured content is handled by CoachCard

  // Don't render structured responses as plain bubbles
  if (typeof message.content !== 'string') {
    return null;
  }

  const handleCopyText = async () => {
    if (textContent) {
      await Clipboard.setStringAsync(textContent);
      Alert.alert('Copié !', 'Le texte a été copié dans le presse-papiers.');
    }
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.coachContainer]}>
      {/* Coach avatar */}
      {!isUser && (
        <View style={styles.avatar}>
          <Image
            source={require("@/assets/logo.png")}
            style={styles.avatarLogo}
            resizeMode="contain"
          />
        </View>
      )}

      <View style={{ maxWidth: '75%' }}>
          <Pressable onLongPress={handleCopyText} delayLongPress={500}>
            <View style={[styles.bubble, isUser ? styles.userBubble : styles.coachBubble]}>
              {/* Image attachments */}
              {hasAttachments && (
                <View style={styles.attachmentsContainer}>
                  {message.attachments!.map((attachment) => (
                    <Pressable
                      key={attachment.id}
                      onPress={() => onAttachmentPress?.(attachment)}
                      style={styles.attachmentWrapper}
                    >
                      <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                      <View style={styles.attachmentOverlay}>
                        <Ionicons name="image" size={12} color="white" />
                        <Text style={styles.attachmentLabel}>Capture</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Text content */}
              {textContent && (
                isUser ? (
                  <Text style={[styles.text, styles.userText]}>
                    {textContent}
                  </Text>
                ) : (
                  <MarkdownText style={styles.coachText}>
                    {textContent}
                  </MarkdownText>
                )
              )}
            </View>
          </Pressable>

          {/* Feedback */}
          {!isUser && onFeedback && (
            <MessageFeedback
               feedback={message.feedback}
               onFeedback={onFeedback}
            />
          )}
      </View>

      {/* User avatar */}
      {isUser && (
        <View style={[styles.avatar, styles.userAvatar]}>
          <Ionicons name="person" size={16} color="white" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  coachContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  avatarLogo: {
    width: 24,
    height: 24,
  },
  userAvatar: {
    backgroundColor: '#374151',
    marginLeft: 8,
    opacity: 0.5,
  },
  bubble: {
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  userBubble: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    borderTopRightRadius: 4,
    marginRight: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  coachBubble: {
    backgroundColor: '#1E1E2E', // Slightly lighter/bluer dark
    borderRadius: 20,
    borderTopLeftRadius: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)', // Purple tint border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  coachText: {
    color: '#E5E7EB',
  },
  attachmentsContainer: {
    marginBottom: 8,
  },
  attachmentWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  attachmentImage: {
    width: 200,
    height: 150,
    backgroundColor: '#0F0F1A',
  },
  attachmentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  attachmentLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
});
