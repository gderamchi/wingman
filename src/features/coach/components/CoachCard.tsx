/**
 * CoachCard Component
 * Displays structured coach responses with context summary and insights
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ContextSummary } from '../types';
import { ChunkReplyButton } from './ChunkReplyButton';

interface CoachCardProps {
  summary: ContextSummary;
  initiallyExpanded?: boolean;
  onReply?: (content: string) => void;
}

const STAGE_LABELS: Record<string, string> = {
  initial_contact: '🆕 Premier contact',
  getting_to_know: '💬 Découverte',
  revival: '🔄 Relance',
  post_seen: '👀 Après vu',
  ghosted: '👻 Ghosté',
  date_proposal: '📅 Proposition date',
  post_date: '☕ Après date',
  other: '💭 Autre',
};

export function CoachCard({ summary, initiallyExpanded = false, onReply }: CoachCardProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  return (
    <View style={styles.container}>
      {/* Header - Always visible */}
      <Pressable style={styles.header} onPress={() => setIsExpanded(!isExpanded)}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="analytics" size={16} color="#8B5CF6" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.stageLabel}>
              {STAGE_LABELS[summary.stage] || STAGE_LABELS.other}
            </Text>
            <Text style={styles.dynamicPreview} numberOfLines={1}>
              {summary.dynamic}
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#6B7280"
        />
      </Pressable>

      {/* Expanded content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Summary */}
          <Text style={styles.summary}>{summary.summary}</Text>

          {/* Reply to summary button */}
          {onReply && (
            <ChunkReplyButton
              chunkContent={summary.summary}
              onReply={onReply}
            />
          )}

          {/* Risk warning */}
          {summary.mainRisk && (
            <View style={styles.riskContainer}>
              <Ionicons name="warning" size={14} color="#F59E0B" />
              <Text style={styles.riskText}>{summary.mainRisk}</Text>
            </View>
          )}

          {/* Insights */}
          {summary.insights && summary.insights.length > 0 && (
            <View style={styles.insightsContainer}>
              {summary.insights.map((insight, idx) => (
                <View key={idx} style={styles.insightRow}>
                  <View style={styles.insightDot} />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  stageLabel: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  dynamicPreview: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  expandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  summary: {
    color: '#E5E7EB',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  riskText: {
    color: '#F59E0B',
    fontSize: 13,
    flex: 1,
  },
  insightsContainer: {
    marginTop: 12,
    gap: 8,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C084FC',
    marginTop: 6,
  },
  insightText: {
    color: '#9CA3AF',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
