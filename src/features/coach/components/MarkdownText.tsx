/**
 * MarkdownText Component
 * Simple markdown renderer for React Native without external dependencies
 * Supports: **bold**, *italic*, \n (line breaks)
 */

import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

interface MarkdownTextProps {
  children: string;
  style?: TextStyle;
}

interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

function parseMarkdown(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  // Regex to match **bold** or *italic* patterns
  // Order matters: check ** first, then *
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add plain text before the match
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index) });
    }

    const matched = match[0];
    if (matched.startsWith('**') && matched.endsWith('**')) {
      // Bold text
      segments.push({ text: matched.slice(2, -2), bold: true });
    } else if (matched.startsWith('*') && matched.endsWith('*')) {
      // Italic text
      segments.push({ text: matched.slice(1, -1), italic: true });
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining plain text
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return segments;
}

export function MarkdownText({ children, style }: MarkdownTextProps) {
  const segments = parseMarkdown(children);

  return (
    <Text style={[styles.base, style]}>
      {segments.map((segment, index) => (
        <Text
          key={index}
          style={[
            segment.bold && styles.bold,
            segment.italic && styles.italic,
          ]}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
});
