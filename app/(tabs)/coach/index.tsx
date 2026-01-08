/**
 * Coach Chat Screen (Main)
 * Unified chat interface replacing the old wizard flow
 */

import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    AttachmentPreview,
    ChatInputBar,
    CoachCard,
    MessageBubble,
    MessageFeedback,
    ReplyCard,
    WingmanTypingIndicator,
    useActiveThread,
    useCoachStore,
    useIsCoachLoading,
    useLoadingPhase,
    usePendingAttachments
} from '@/src/features/coach';
import { QuickChip } from '@/src/features/coach/components/QuickChip';
import { SuggestedActions } from '@/src/features/coach/components/SuggestedActions';
import type { CoachMessage, ReadyReply, StructuredCoachResponse } from '@/src/features/coach/types';

export default function CoachChatScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [inputText, setInputText] = React.useState('');
  const [previewImage, setPreviewImage] = React.useState<any>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const activeThread = useActiveThread();
  const isLoading = useIsCoachLoading();
  const loadingPhase = useLoadingPhase();
  // const pendingAttachment = usePendingAttachment(); // REMOVED
  const {
    initialize,
    sendMessage,
    sendMediaForAnalysis,
    addPendingAttachments,
    removePendingAttachment,
    clearPendingAttachments,
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

  const pendingAttachments = usePendingAttachments();

  const handleSendMessage = async (text: string) => {
    const messageToSend = text;
    setInputText(''); // Clear input immediately for better UX
    if (pendingAttachments.length > 0) {
      // Send images + optional user comment
      await sendMediaForAnalysis(pendingAttachments, messageToSend);
    } else {
      // Regular text message
      await sendMessage(messageToSend);
    }
  };

  const handlePickImage = async () => {
    // Show option picker (using generic alert for simplicity, could be a modal)
    Alert.alert(
      t('coach.attachment.title', 'Ajouter une pièce jointe'),
      t('coach.attachment.message', 'Que veux-tu envoyer ?'),
      [
        {
          text: t('coach.attachment.cancel', 'Annuler'),
          style: 'cancel',
        },
        {
          text: t('coach.attachment.audio', 'Fichier Audio'),
          onPress: handlePickAudio,
        },
        {
          text: t('coach.attachment.image', 'Images'),
          onPress: pickImages,
        },
      ]
    );
  };

  const pickImages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission requise', 'Accès à la galerie nécessaire');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 50,
        base64: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets.length > 0) {
        setIsUploading(true);
        try {
          const newAttachments: any[] = result.assets.map(asset => ({
            id: Date.now().toString() + Math.random().toString(),
            type: 'image',
            uri: asset.uri,
            base64: asset.base64,
          }));

          addPendingAttachments(newAttachments);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
       console.error('Image picker error', error);
       setIsUploading(false);
    }
  };

  const handlePickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'video/mp4', 'video/mpeg'], // Some audio is detected as video
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Check size (20MB = 20 * 1024 * 1024 bytes)
        const size = asset.size || 0;
        if (size > 20 * 1024 * 1024) {
          Alert.alert(
            t('coach.attachment.error.title', 'Fichier trop volumineux'),
            t('coach.attachment.error.message', 'La taille maximum est de 20MB.')
          );
          return;
        }

        setIsUploading(true);
        try {
          // Read as base64
          const base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: 'base64',
          });

          const newAttachment: any = {
            id: Date.now().toString() + Math.random().toString(),
            type: 'audio',
            uri: asset.uri,
            base64: base64,
            mimeType: asset.mimeType,
            fileName: asset.name,
            duration: 0, // Duration not easily available without extra lib
          };

          addPendingAttachments([newAttachment]);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error('Audio picker error', error);
      setIsUploading(false);
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
    // Append to input instead of sending immediately
    setInputText(prev => (prev ? prev + " " + value : value));
  };

  const handleAttachmentPress = (attachment: any) => {
    setPreviewImage(attachment);
  };

  const handleChunkReply = (content: string) => {
    // Prefix the input with context reference
    const prefix = `En référence à: "${content}"\n\n`;
    setInputText(prefix);
    // Could also scroll to input or focus it here
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
            onReply={handleChunkReply}
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
                      {q.chips.map((chip, chipIndex) => (
                         <QuickChip
                            key={chip.id || `chip-${q.id}-${chipIndex}`}
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
           onAttachmentPress={handleAttachmentPress}
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
         keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
                     <View style={styles.logoGlow} />
                  </View>
                  <Text style={styles.emptyTitle}>
                     {t('coach.empty.title', 'Prêt à progresser ?')}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                     {t('coach.empty.subtitle', 'Commence par envoyer une capture de conversation.')}
                  </Text>

                  {/* Suggested Actions */}
                  <View style={styles.suggestionsContainer}>
                     <SuggestedActions
                        onPressAnalyze={handlePickImage}
                     />
                  </View>
               </View>
            }
           ListFooterComponent={
             isLoading ? (
               <View style={styles.typingIndicatorContainer}>
                 <WingmanTypingIndicator isVisible={isLoading} phase={loadingPhase} />
               </View>
             ) : null
           }
         />

         {/* Attachment Preview (Horizontal Scroll) */}
         {pendingAttachments.length > 0 && (
            <View style={{ maxHeight: 120 }}>
              <FlatList
                data={pendingAttachments}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={{ marginRight: 12 }}>
                    <AttachmentPreview
                      attachment={item}
                      onRemove={() => removePendingAttachment(item.id)}
                    />
                  </View>
                )}
              />
            </View>
         )}



         {/* Input Bar */}
         <ChatInputBar
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSendMessage}
            onAttach={handlePickImage}
            isLoading={isLoading || isUploading}
            hasAttachments={pendingAttachments.length > 0}
         />
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent={true}
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.closeButton} onPress={() => setPreviewImage(null)}>
            <Ionicons name="close-circle" size={40} color="white" />
          </Pressable>
          {previewImage && (
            <Image
              source={{ uri: previewImage.uri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 40,
    // Add shadow/glow manually without overflow hidden to let glow spread
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGlow: {
     position: 'absolute',
     width: '100%',
     height: '100%',
     borderRadius: 40,
     backgroundColor: 'rgba(139, 92, 246, 0.1)',
     zIndex: -1,
  },
  emptyLogo: {
    width: 48,
    height: 48,
    tintColor: '#A78BFA', // Tint logo for better integration if it's white/monochrome
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
    maxWidth: 280,
  },
  suggestionsContainer: {
     width: '100%',
     marginTop: 0, // Handled inside SuggestedActions margin
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  typingIndicatorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
