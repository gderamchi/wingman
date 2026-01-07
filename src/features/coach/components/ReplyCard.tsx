/**
 * ReplyCard Component
 * Displays a ready-to-send reply suggestion with copy button and reasoning
 */

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ReadyReply, ReplyTone } from '../types';

interface ReplyCardProps {
  reply: ReadyReply;
  index: number;
  isSelected?: boolean;
  onSelect?: (reply: ReadyReply) => void;
  onUse?: (reply: ReadyReply) => void;
}

const TONE_CONFIG: Record<ReplyTone, { emoji: string; label: string; color: string }> = {
  soft: { emoji: '🌸', label: 'Doux', color: '#EC4899' },
  direct: { emoji: '🎯', label: 'Direct', color: '#3B82F6' },
  playful: { emoji: '😄', label: 'Joueur', color: '#10B981' },
  serious: { emoji: '🤔', label: 'Sérieux', color: '#6B7280' },
  flirty: { emoji: '💜', label: 'Flirt', color: '#8B5CF6' },
  casual: { emoji: '✌️', label: 'Casual', color: '#EAB308' },
};

export function ReplyCard({ reply, index, isSelected, onSelect, onUse }: ReplyCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const toneConfig = TONE_CONFIG[reply.tone] || TONE_CONFIG.casual;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(reply.text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePress = () => {
    if (onSelect) {
      onSelect(reply);
    }
    setShowDetails(!showDetails);
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View
        style={[
          styles.card,
          isSelected && styles.selectedCard,
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.indexBadge, isSelected && styles.selectedBadge]}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <View style={[styles.toneBadge, { backgroundColor: `${toneConfig.color}20` }]}>
              <Text style={styles.toneEmoji}>{toneConfig.emoji}</Text>
              <Text style={[styles.toneLabel, { color: toneConfig.color }]}>
                {toneConfig.label}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={handleCopy} style={styles.copyButton}>
              <Ionicons
                name={isCopied ? 'checkmark' : 'copy-outline'}
                size={16}
                color={isCopied ? '#10B981' : '#8B5CF6'}
              />
            </Pressable>
            {isSelected && <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />}
          </View>
        </View>

        {/* Reply text */}
        <Text style={[styles.replyText, isSelected && styles.selectedText]}>
          "{reply.text}"
        </Text>

        {/* Details (expanded) */}
        {showDetails && (
          <View style={styles.detailsContainer}>
            {/* Why it works */}
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.detailText}>{reply.whyItWorks}</Text>
            </View>
            {/* Risk to avoid */}
            <View style={styles.detailRow}>
              <Ionicons name="alert-circle" size={14} color="#F59E0B" />
              <Text style={styles.detailText}>{reply.riskToAvoid}</Text>
            </View>
          </View>
        )}

        {/* Use button (when selected) */}
        {isSelected && onUse && (
          <Pressable onPress={() => onUse(reply)} style={styles.useButton}>
            <Text style={styles.useButtonText}>Utiliser cette réponse</Text>
            <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedCard: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    backgroundColor: '#8B5CF6',
  },
  indexText: {
    color: '#C084FC',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  toneEmoji: {
    fontSize: 12,
  },
  toneLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyText: {
    color: '#D1D5DB',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '500',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detailsContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailText: {
    color: '#9CA3AF',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  useButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
});
