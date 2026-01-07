/**
 * ContextQuestionsCard Component (Iterative Version)
 * Displays a SINGLE question with chips for the iterative flow
 * Appears inline in the chat as an assistant message
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    useCoachStore,
    useHasEnoughContext,
    useNextQuestion,
} from '../stores/coachStore';
import type { QuickChipData } from '../types';

interface ContextQuestionsCardProps {
  /** Called when user taps a chip */
  onAnswerSelected?: (questionId: string, answer: string) => void;
}

/**
 * Renders a single context question with answer chips
 * Used inside the chat as an interactive assistant message
 */
export function ContextQuestionsCard({ onAnswerSelected }: ContextQuestionsCardProps) {
  const question = useNextQuestion();
  const hasEnoughContext = useHasEnoughContext();
  const answerContextQuestion = useCoachStore((s) => s.answerContextQuestion);

  // If we have enough context or no question, don't render
  if (hasEnoughContext || !question) {
    return null;
  }

  const handleChipPress = async (chip: QuickChipData) => {
    // Call the store action (which will add messages and inject next question)
    await answerContextQuestion(question.id, chip.value);

    // Optional callback for parent
    if (onAnswerSelected) {
      onAnswerSelected(question.id, chip.value);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{question.question}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {question.chips.map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={styles.chip}
            onPress={() => handleChipPress(chip)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 22,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chipText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
});
