/**
 * AttachmentPreview Component
 * Image attachment preview above input with remove button
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MessageAttachment } from '../types';

interface AttachmentPreviewProps {
  attachment: MessageAttachment;
  onRemove: () => void;
  isUploading?: boolean;
}

export function AttachmentPreview({ attachment, onRemove, isUploading }: AttachmentPreviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: attachment.uri }} style={styles.image} />

        {/* Loading overlay */}
        {isUploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#8B5CF6" size="small" />
            <Text style={styles.loadingText}>Préparation...</Text>
          </View>
        )}

        {/* Remove button */}
        {!isUploading && (
          <Pressable onPress={onRemove} style={styles.removeButton}>
            <Ionicons name="close" size={14} color="white" />
          </Pressable>
        )}

        {/* Type indicator */}
        <View style={styles.typeIndicator}>
          <Ionicons name="image" size={12} color="#8B5CF6" />
          <Text style={styles.typeText}>Capture</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  imageWrapper: {
    width: 120,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  typeText: {
    color: '#C084FC',
    fontSize: 10,
    fontWeight: '500',
  },
});
