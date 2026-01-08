/**
 * Threads Screen
 * List of past conversation threads
 */

import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActiveThread, useCoachStore, useThreads } from '@/src/features/coach';

export default function ThreadsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const threads = useThreads();
  const activeThread = useActiveThread();
  const { deleteThread, createThread, selectThread, updateThread, initialize } = useCoachStore();

  useEffect(() => {
    initialize();
  }, []);

  const handleNewConversation = async () => {
    await createThread();
    router.dismiss();
  };

  const handleSelectThread = (threadId: string) => {
    selectThread(threadId);
    router.dismiss();
  };

  const handleDeleteThread = (threadId: string) => {
    Alert.alert(
      t('common.delete'),
      t('coach.threads.deleteConfirm', 'Supprimer cette conversation ?'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
             await deleteThread(threadId);
             // If we just deleted the active thread and there are no more threads, create a new one
             if (activeThread?.id === threadId && threads.length <= 1) {
                await createThread();
             }
          },
        },
      ]
    );
  };

  const handleRenameThread = (threadId: string, currentTitle: string) => {
    Alert.prompt(
      t('coach.threads.rename', 'Renommer'),
      t('coach.threads.renameMessage', 'Nouveau nom de la conversation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.save', 'Enregistrer'),
          onPress: async (newTitle?: string) => {
            if (newTitle?.trim()) {
              await updateThread(threadId, { title: newTitle.trim() });
            }
          },
        },
      ],
      'plain-text',
      currentTitle || ''
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const isActive = activeThread?.id === item.id;
    const date = new Date(item.updatedAt);
    const dateStr = format(date, 'd MMM yyyy', { locale: fr });
    const timeStr = format(date, 'HH:mm', { locale: fr });

    return (
      <Pressable
        onPress={() => handleSelectThread(item.id)}
        style={({ pressed }) => [
          styles.item,
          isActive && styles.activeItem,
          pressed && styles.pressedItem,
        ]}
      >
        <View style={styles.itemContent}>
          <Text
            style={[styles.itemTitle, isActive && styles.activeItemTitle]}
            numberOfLines={1}
          >
            {item.title || t('coach.threads.newConversation', 'Nouvelle conversation')}
          </Text>
          <Text style={styles.itemDate}>
            {dateStr} • {timeStr}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              handleRenameThread(item.id, item.title);
            }}
            style={styles.actionButton}
            hitSlop={10}
          >
            <Ionicons name="pencil-outline" size={18} color="#6B7280" />
          </Pressable>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteThread(item.id);
            }}
            style={styles.actionButton}
            hitSlop={10}
          >
            <Ionicons name="trash-outline" size={20} color="#6B7280" />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('coach.threads.title', 'Conversations')}</Text>
        <Pressable onPress={() => router.dismiss()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* New Conversation Button */}
      <Pressable onPress={handleNewConversation} style={styles.newButton}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.newButtonText}>
          {t('coach.threads.new', 'Nouvelle conversation')}
        </Text>
      </Pressable>

      {/* Thread List */}
      <FlatList
        data={threads}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#4B5563" />
            <Text style={styles.emptyText}>
              {t('coach.threads.empty', 'Aucune conversation')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    gap: 8,
  },
  newButtonText: {
    color: '#C084FC',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeItem: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  pressedItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activeItemTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  itemDate: {
    color: '#6B7280',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 12,
  },
});
