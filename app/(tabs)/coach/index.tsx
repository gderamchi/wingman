/**
 * Coach Chat Screen (Main)
 * Unified chat interface replacing the old wizard flow
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    AttachmentPreview,
    ChatInputBar,
    CoachCard,
    MessageBubble,
    MessageFeedback,
    ReplyCard,
    ShimmerLoader,
    useActiveThread,
    useCoachStore,
    useIsCoachLoading,
    usePendingAttachment
} from '@/src/features/coach';
import { QuickChip } from '@/src/features/coach/components/QuickChip';
import type { CoachMessage, ReadyReply, StructuredCoachResponse } from '@/src/features/coach/types';

export default function CoachChatScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const activeThread = useActiveThread();
  const isLoading = useIsCoachLoading();
  const pendingAttachment = usePendingAttachment();
  const {
    initialize,
    sendMessage,
    sendImageForAnalysis,
    setPendingAttachment,
    clearPendingAttachment,
    createThread,
    submitFeedback,
  } = useCoachStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (activeThread?.messages.length) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeThread?.messages.length]);

  const handleSendMessage = async (text: string) => {
    if (pendingAttachment) {
      // Send image + optional user comment
      await sendImageForAnalysis(pendingAttachment.base64!, pendingAttachment.uri, text);
    } else {
      // Regular text message
      await sendMessage(text);
    }
  };

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission requise', 'Accès à la galerie nécessaire');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].base64) {
        setPendingAttachment({
          id: Date.now().toString(),
          type: 'image',
          uri: result.assets[0].uri,
          base64: result.assets[0].base64,
        });
      }
    } catch (error) {
       console.error('Image picker error', error);
    }
  };

  const handleReplySelected = (reply: ReadyReply) => {
    // When user selects a reply, we can auto-fill input or just copy?
    // User requested "Use this reply" -> Prompt outcome
    // For now, let's just create a user message saying they used it?
    // Or maybe just copy it to clipboard (handled inside card)
    // Let's implement "Use" as updating the outcome prompt
  };

  const handleChipPress = (value: string) => {
    sendMessage(value);
  };

  const renderMessageContent = (message: CoachMessage) => {
    // Simple text message
    if (typeof message.content === 'string') {
      return null; // Handled by MessageBubble
    }

    // Structured response
    const structured = message.content as StructuredCoachResponse;

    return (
      <View style={styles.structuredContainer}>
        {/* Language & Platform Badge */}
        {structured.detectedLanguage && (
          <View style={styles.badgeContainer}>
             <View style={styles.badge}>
                <Text style={styles.badgeText}>
                   {structured.detectedLanguage.toUpperCase()}
                </Text>
             </View>
             {structured.detectedPlatform && (
                <View style={styles.badge}>
                   <Text style={styles.badgeText}>
                      {structured.detectedPlatform.charAt(0).toUpperCase() + structured.detectedPlatform.slice(1)}
                   </Text>
                </View>
             )}
          </View>
        )}

        {/* 1. Context Summary Card */}
        {structured.contextSummary && (
          <CoachCard
            summary={structured.contextSummary}
            initiallyExpanded={true} // Expand latest analysis
          />
        )}

        {/* 2. Clarification Questions */}
        {structured.clarificationQuestions && structured.clarificationQuestions.length > 0 && (
          <View style={styles.sectionContainer}>
             <Text style={styles.sectionTitle}>
               {t('coach.questions.title', 'Questions de clarification')}
             </Text>
             {structured.clarificationQuestions.map((q) => (
                <View key={q.id} style={styles.questionBlock}>
                   <Text style={styles.questionText}>{q.question}</Text>
                   <View style={styles.chipsContainer}>
                      {q.chips.map((chip) => (
                         <QuickChip
                            key={chip.id}
                            label={chip.label}
                            onPress={() => handleChipPress(chip.value)}
                         />
                      ))}
                   </View>
                </View>
             ))}
          </View>
        )}

        {/* 3. Reply Suggestions */}
        {structured.replySuggestions && structured.replySuggestions.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {t('coach.suggestions.title', 'Suggestions de réponses')}
            </Text>
            {structured.replySuggestions.map((reply, index) => (
              <ReplyCard
                key={reply.id}
                index={index}
                reply={reply}
                // isSelected/onUse logic can be added here
              />
            ))}
          </View>
        )}

        {/* Global Feedback for Structured Analysis */}
        <View style={styles.feedbackContainer}>
            <MessageFeedback
               feedback={message.feedback}
               onFeedback={(rating) => submitFeedback(message.id, rating)}
            />
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: CoachMessage }) => {
    const isStructured = typeof item.content !== 'string';

    return (
      <View>
        <MessageBubble
           message={item}
           onFeedback={(rating) => submitFeedback(item.id, rating)}
        />
        {isStructured && renderMessageContent(item)}
      </View>
    );
  };

  const displayMessages = activeThread?.messages || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => router.push('/(tabs)/coach/threads')}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {activeThread?.title || t('coach.chat.title', 'Wingman Coach')}
          </Text>
        </View>
        <View style={styles.headerRight}>
           <Pressable onPress={() => createThread()} style={styles.newChatButton}>
              <Ionicons name="create-outline" size={24} color="#fff" />
           </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
         style={styles.keyboardView}
         keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
         <FlatList
           ref={flatListRef}
           data={displayMessages}
           renderItem={renderItem}
           keyExtractor={(item) => item.id}
           contentContainerStyle={styles.listContent}
           ListEmptyComponent={
              <View style={styles.emptyContainer}>
                 <View style={styles.logoWrapper}>
                    <Image
                      source={require("@/assets/logo.png")}
                      style={styles.emptyLogo}
                      resizeMode="contain"
                    />
                 </View>
                 <Text style={styles.emptyTitle}>
                    {t('coach.empty.title', 'Prêt à progresser ?')}
                 </Text>
                 <Text style={styles.emptySubtitle}>
                    {t('coach.empty.subtitle', 'Envoie une capture de conversation pour commencer.')}
                 </Text>
              </View>
           }
         />

         {/* Attachment Preview */}
         {pendingAttachment && (
            <AttachmentPreview
               attachment={pendingAttachment}
               onRemove={clearPendingAttachment}
            />
         )}

         {/* Loading Shimmer */}
         <ShimmerLoader isVisible={isLoading} />

         {/* Input Bar */}
         <ChatInputBar
            onSend={handleSendMessage}
            onAttach={handlePickImage}
            isLoading={isLoading}
         />
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerRight: {
     flexDirection: 'row',
     gap: 12
  },
  menuButton: {
    padding: 4,
  },
  newChatButton: {
     padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 100, // Visual offset
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    overflow: 'hidden',
  },
  emptyLogo: {
    width: 56,
    height: 56,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  structuredContainer: {
     marginBottom: 16,
  },
  sectionContainer: {
     marginVertical: 12,
  },
  sectionTitle: {
     color: '#9CA3AF',
     fontSize: 13,
     fontWeight: '600',
     textTransform: 'uppercase',
     marginHorizontal: 16,
     marginBottom: 12,
     letterSpacing: 0.5,
  },
  questionBlock: {
     marginHorizontal: 16,
     marginBottom: 16,
  },
  questionText: {
     color: '#E5E7EB',
     fontSize: 16,
     marginBottom: 12,
     lineHeight: 24,
  },
  chipsContainer: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     gap: 8,
  },
  badgeContainer: {
     flexDirection: 'row',
     gap: 8,
     marginHorizontal: 16,
     marginBottom: 8,
  },
  badge: {
     backgroundColor: 'rgba(139, 92, 246, 0.1)',
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 6,
     borderWidth: 1,
     borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  badgeText: {
     color: '#A78BFA',
     fontSize: 10,
     fontWeight: '700',
  },
  feedbackContainer: {
     marginHorizontal: 16,
     marginTop: 8,
     marginBottom: 16,
  }
});
