import { create } from 'zustand';

import type { Message } from '@/src/core/api/blackbox';
import { blackboxAI } from '@/src/core/api/blackbox';

import { Directory, File, Paths } from 'expo-file-system';
import * as storage from '../services/coachStorage';
import { createDefaultThreadContext, questionService } from '../services/questionService';
import { ragClient } from '../services/ragClient';
import type {
  CoachMessage,
  CoachStoreState,
  CoachThread,
  ContextualQuestion,
  MessageAttachment,
  ThreadContext,
  UserFeedback,
  UserPreferences
} from '../types';
import { buildAnalysisPrompt, buildCoachSystemPrompt, parseStructuredResponse } from './coachPrompts';

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Helper to save attachment to permanent storage
const saveAttachmentToStorage = async (uri: string, id: string, type: 'image' | 'audio', mimeType?: string): Promise<string> => {
  try {
    const dirName = type === 'image' ? 'images' : 'audio';
    const extension = type === 'image' ? 'jpg' : (mimeType?.split('/')[1] || 'm4a'); // Default to m4a or infer from mime

    const mediaDir = new Directory(Paths.document, dirName);
    if (!mediaDir.exists) {
      mediaDir.create({ intermediates: true });
    }

    const sourceFile = new File(uri);
    const destinationFile = new File(mediaDir, `${id}.${extension}`);
    sourceFile.copy(destinationFile);

    return destinationFile.uri;
  } catch (error) {
    console.error(`Failed to save ${type}:`, error);
    return uri; // Fallback to original URI
  }
};

interface CoachStoreActions {
  // Initialization
  initialize: () => Promise<void>;

  // Thread management
  createThread: (goal?: string, style?: string) => Promise<string>;
  selectThread: (threadId: string) => void;
  deleteThread: (threadId: string) => Promise<void>;
  getActiveThread: () => CoachThread | null;

  // Messaging
  sendMessage: (content: string) => Promise<void>;
  sendMediaForAnalysis: (attachments: MessageAttachment[], userComment?: string) => Promise<void>;
  submitFeedback: (messageId: string, rating: 'helpful' | 'not_helpful', reason?: string) => Promise<void>;

  // Context Questions (Proactive Question System - Iterative)
  getNextQuestion: () => ContextualQuestion | null;
  answerContextQuestion: (questionId: string, answer: string) => Promise<void>;
  injectNextQuestionAsMessage: () => Promise<void>;
  hasEnoughContext: () => boolean;
  getThreadContext: () => ThreadContext | null;

  // Attachments
  setPendingAttachments: (attachments: MessageAttachment[]) => void;
  addPendingAttachments: (attachments: MessageAttachment[]) => void;
  removePendingAttachment: (id: string) => void;
  clearPendingAttachments: () => void;

  // Preferences
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;

  // Data management
  clearAllData: () => Promise<void>;

  // Reset
  reset: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultTone: 'playful',
  replyLength: 'medium',
  useEmojis: true,
  interfaceLanguage: 'fr',
};

export const useCoachStore = create<CoachStoreState & CoachStoreActions>((set, get) => ({
  // Initial state
  threads: [],
  activeThreadId: null,
  pendingAttachments: [],
  isLoading: false,
  error: null,
  preferences: DEFAULT_PREFERENCES,

  // Initialize store from local storage
  initialize: async () => {
    try {
      const [threads, preferences, activeThreadId] = await Promise.all([
        storage.loadThreads(),
        storage.loadPreferences(),
        storage.loadActiveThreadId(),
      ]);

      set({
        threads,
        preferences: preferences || DEFAULT_PREFERENCES,
        activeThreadId: activeThreadId || null,
      });
    } catch (error) {
      console.error('[CoachStore] Failed to initialize:', error);
    }
  },

  // Create a new thread
  createThread: async (goal = 'dating', style = 'playful') => {
    const newThread: CoachThread = {
      id: generateId(),
      title: 'Nouvelle conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      metadata: {
        goal: goal as CoachThread['metadata']['goal'],
        style: style as CoachThread['metadata']['style'],
      },
      context: createDefaultThreadContext(),
    };

    const threads = [newThread, ...get().threads];

    set({ threads, activeThreadId: newThread.id });

    await storage.saveThread(newThread);
    await storage.saveActiveThreadId(newThread.id);

    // Auto-inject the first question to start the conversation
    await get().injectNextQuestionAsMessage();

    return newThread.id;
  },

  // Select an existing thread
  selectThread: (threadId) => {
    set({ activeThreadId: threadId });
    storage.saveActiveThreadId(threadId);
  },

  // Delete a thread
  deleteThread: async (threadId) => {
    const { threads, activeThreadId } = get();
    const newThreads = threads.filter((t) => t.id !== threadId);

    set({
      threads: newThreads,
      activeThreadId: activeThreadId === threadId ? null : activeThreadId,
    });

    await storage.deleteThread(threadId);

    if (activeThreadId === threadId) {
      await storage.saveActiveThreadId(null);
    }
  },

  // Get the currently active thread
  getActiveThread: () => {
    const { threads, activeThreadId } = get();
    return threads.find((t) => t.id === activeThreadId) || null;
  },

  // Send a text message
  sendMessage: async (content) => {
    const { threads, activeThreadId, preferences } = get();

    if (!activeThreadId) {
      // Create a new thread if none exists
      await get().createThread();
    }

    const thread = get().getActiveThread();
    if (!thread) return;

    // Add user message
    const userMessage: CoachMessage = {
      id: generateId(),
      threadId: thread.id,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...thread.messages, userMessage];
    const updatedThread = {
      ...thread,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    // Update state
    set({
      threads: threads.map((t) => (t.id === thread.id ? updatedThread : t)),
      isLoading: true,
      error: null,
    });

    try {
      // Fetch RAG Context with enhanced retrieval
      const ragExamples = await ragClient.retrieveCoachingExamples({
        goal: thread.metadata.goal,
        style: thread.metadata.style,
        userMessage: content,
      });
      const ragContext = ragClient.formatExamplesForPrompt(ragExamples);
      const principles = ragClient.formatPrinciplesForPrompt();
      const platformContext = ''; // No platform detected for text messages

      // Build messages for AI
      const aiMessages: Message[] = [
        { role: 'system', content: buildCoachSystemPrompt(thread.metadata, preferences, ragContext, principles, platformContext, thread.context) },
        ...updatedMessages.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        })),
      ];

      // Call AI
      const response = await blackboxAI.chat(aiMessages);
      const rawContent = response.choices[0].message.content;
      const responseContent = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      // Parse structured response
      const structuredResponse = parseStructuredResponse(responseContent);

      // Add assistant message
      const assistantMessage: CoachMessage = {
        id: generateId(),
        threadId: thread.id,
        role: 'assistant',
        content: structuredResponse || responseContent,
        createdAt: new Date().toISOString(),
      };

      const finalThread = {
        ...updatedThread,
        messages: [...updatedMessages, assistantMessage],
        updatedAt: new Date().toISOString(),
        // Update title from first meaningful exchange
        title:
          thread.messages.length === 0
            ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
            : thread.title,
      };

      set({
        threads: get().threads.map((t) => (t.id === thread.id ? finalThread : t)),
        isLoading: false,
      });

      await storage.saveThread(finalThread);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi',
      });
    }
  },

  // Send media (images/audio) for analysis
  sendMediaForAnalysis: async (attachments, userComment) => {
    const { threads, activeThreadId, preferences } = get();

    // Create thread if needed
    if (!activeThreadId) {
      await get().createThread();
    }

    const thread = get().getActiveThread();
    if (!thread) return;

    // Use user's comment if provided, otherwise use empty string
    const messageContent = userComment?.trim() || '';

    // Process attachments: Save to storage and remove base64
    const storedAttachments: MessageAttachment[] = await Promise.all(
      attachments.map(async (att) => {
        const savedUri = await saveAttachmentToStorage(att.uri, att.id, att.type, att.mimeType);
        // Return without base64 to save space
        return {
          id: att.id,
          type: att.type,
          uri: savedUri,
          mimeType: att.mimeType,
          duration: att.duration,
          fileName: att.fileName,
        };
      })
    );

    const userMessage: CoachMessage = {
      id: generateId(),
      threadId: thread.id,
      role: 'user',
      content: messageContent,
      createdAt: new Date().toISOString(),
      attachments: storedAttachments,
    };

    const updatedMessages = [...thread.messages, userMessage];
    const updatedThread = {
      ...thread,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    set({
      threads: threads.map((t) => (t.id === thread.id ? updatedThread : t)),
      pendingAttachments: [],
      isLoading: true,
      error: null,
    });

    try {
      // Get RAG examples
      const ragExamples = await ragClient.retrieveCoachingExamples({
        goal: thread.metadata.goal,
        style: thread.metadata.style,
        userMessage: userComment,
      });

      const ragContext = ragClient.formatExamplesForPrompt(ragExamples);
      const principles = ragClient.formatPrinciplesForPrompt();
      const platformContext = ragClient.formatPlatformContext(undefined);

      // Build analysis prompt
      const systemPrompt = buildAnalysisPrompt(thread.metadata, preferences, ragContext, principles, platformContext, thread.context);

      // Construct content array with original base64 for AI
      // Note: We use the `attachments` argument which still has base64
      const contentArray: any[] = attachments.map(att => {
        if (att.type === 'image') {
          return {
            type: 'image_url',
            image_url: {
              url: att.base64?.startsWith('data:')
                ? att.base64
                : `data:image/png;base64,${att.base64 || ''}`,
            },
          };
        } else if (att.type === 'audio') {
           // For Gemini via Blackbox, we'll try sending as image_url data uri with audio mime type
           // OR standard OpenAI audio format if supported.
           // Given the plan assumption:
           return {
              type: 'image_url', // HACK: Using image_url interface for general file data transmission if API supports it
              image_url: {
                 url: att.base64?.startsWith('data:')
                 ? att.base64
                 : `data:${att.mimeType || 'audio/mpeg'};base64,${att.base64 || ''}`
              }
           };
        }
        return null;
      }).filter(Boolean);

      // Add text at the end
      const defaultText = attachments.some(a => a.type === 'audio')
        ? 'Analyse cet enregistrement audio (ton, émotion, contenu) et suggère-moi la meilleure façon de répondre.'
        : 'Analyse ces captures d\'écran de conversation (timeline chronologique) et suggère-moi des réponses.';

      contentArray.push({
        type: 'text',
        text: userComment?.trim() || defaultText,
      });

      const aiMessages: Message[] = [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: contentArray,
        },
      ];

      // Call AI
      const response = await blackboxAI.chat(aiMessages);
      const rawContent = response.choices[0].message.content;
      const responseContent = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      // Parse structured response
      const structuredResponse = parseStructuredResponse(responseContent);

      // Smart detection: Update context from AI analysis (auto-detect platform, etc.)
      let updatedContextFromAnalysis = updatedThread.context || createDefaultThreadContext();
      if (structuredResponse) {
        updatedContextFromAnalysis = questionService.updateContextFromAnalysis(
          updatedContextFromAnalysis,
          structuredResponse
        );
      }

      // Add assistant message
      const assistantMessage: CoachMessage = {
        id: generateId(),
        threadId: thread.id,
        role: 'assistant',
        content: structuredResponse || responseContent,
        createdAt: new Date().toISOString(),
      };

      const finalThread = {
        ...updatedThread,
        messages: [...updatedMessages, assistantMessage],
        context: updatedContextFromAnalysis,
        updatedAt: new Date().toISOString(),
        title: 'Analyse de conversation',
      };

      set({
        threads: get().threads.map((t) => (t.id === thread.id ? finalThread : t)),
        isLoading: false,
      });

      await storage.saveThread(finalThread);
    } catch (error) {
      console.error(error); // Log error
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'analyse',
      });
    }
  },

  // Set pending attachments (replace)
  setPendingAttachments: (attachments) => {
    set({ pendingAttachments: attachments });
  },

  // Add pending attachments (append)
  addPendingAttachments: (attachments) => {
    set((state) => ({
      pendingAttachments: [...state.pendingAttachments, ...attachments]
    }));
  },

  // Remove single attachment
  removePendingAttachment: (id) => {
    set((state) => ({
      pendingAttachments: state.pendingAttachments.filter(a => a.id !== id)
    }));
  },

  // Clear pending attachments
  clearPendingAttachments: () => {
    set({ pendingAttachments: [] });
  },

  // Update preferences
  updatePreferences: async (prefs) => {
    const newPrefs = { ...get().preferences, ...prefs };
    set({ preferences: newPrefs });
    await storage.savePreferences(newPrefs);
  },

  // Clear all data
  clearAllData: async () => {
    await storage.clearAllCoachData();
    set({
      threads: [],
      activeThreadId: null,
      pendingAttachments: [],
      preferences: DEFAULT_PREFERENCES,
    });
  },

  submitFeedback: async (messageId: string, rating: 'helpful' | 'not_helpful', reason?: string) => {
    const { threads, activeThreadId } = get();
    const thread = threads.find((t) => t.id === activeThreadId);
    if (!thread) return;

    const feedback: UserFeedback = {
      rating,
      reason,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = thread.messages.map((m) =>
      m.id === messageId ? { ...m, feedback } : m
    );

    const updatedThread = { ...thread, messages: updatedMessages };

    // Update state
    set({
      threads: threads.map((t) => (t.id === thread.id ? updatedThread : t)),
    });

    // Persist
    await storage.saveThread(updatedThread);
  },

  // ============================================================
  // Context Questions (Proactive Question System)
  // ============================================================

  // ============================================================
  // Context Questions (Proactive Question System - Iterative)
  // ============================================================

  // Get the NEXT question to ask (one at a time)
  getNextQuestion: () => {
    const thread = get().getActiveThread();
    if (!thread) return null;

    const context = thread.context || createDefaultThreadContext();
    return questionService.getNextQuestion(context);
  },

  // Answer a context question and inject next question as message
  answerContextQuestion: async (questionId, answer) => {
    const { threads } = get();
    const thread = get().getActiveThread();
    if (!thread) return;

    const currentContext = thread.context || createDefaultThreadContext();
    const updatedContext = questionService.processAnswer(currentContext, questionId, answer);

    // Add user's answer as a message
    const userMessage: CoachMessage = {
      id: generateId(),
      threadId: thread.id,
      role: 'user',
      content: answer, // Store the raw answer value
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...thread.messages, userMessage];

    const updatedThread = {
      ...thread,
      messages: updatedMessages,
      context: updatedContext,
      updatedAt: new Date().toISOString(),
    };

    set({
      threads: threads.map((t) => (t.id === thread.id ? updatedThread : t)),
    });

    await storage.saveThread(updatedThread);

    // Automatically inject next question if needed
    await get().injectNextQuestionAsMessage();
  },

  // Inject the next question as an assistant message
  injectNextQuestionAsMessage: async () => {
    const { threads } = get();
    const thread = get().getActiveThread();
    if (!thread) return;

    const context = thread.context || createDefaultThreadContext();
    const nextQuestion = questionService.getNextQuestion(context);

    if (!nextQuestion) {
      // No more questions needed - context is complete!
      return;
    }

    // Check if this is the first question (for encouragement message)
    const isFirstQuestion = thread.messages.length === 0 ||
      !thread.messages.some(m => m.role === 'assistant');

    // Create assistant message with the question
    const questionContent = questionService.formatQuestionAsMessage(nextQuestion, isFirstQuestion);

    const assistantMessage: CoachMessage = {
      id: generateId(),
      threadId: thread.id,
      role: 'assistant',
      content: questionContent,
      createdAt: new Date().toISOString(),
    };

    const updatedThread = {
      ...thread,
      messages: [...thread.messages, assistantMessage],
      updatedAt: new Date().toISOString(),
    };

    set({
      threads: threads.map((t) => (t.id === thread.id ? updatedThread : t)),
    });

    await storage.saveThread(updatedThread);
  },

  // Check if we have enough context
  hasEnoughContext: () => {
    const thread = get().getActiveThread();
    if (!thread) return false;

    const context = thread.context || createDefaultThreadContext();
    return questionService.hasEnoughContext(context);
  },

  // Get the current thread context
  getThreadContext: () => {
    const thread = get().getActiveThread();
    if (!thread) return null;
    return thread.context || null;
  },

  // Reset store (without clearing storage)
  reset: () => {
    set({
      threads: [],
      activeThreadId: null,
      pendingAttachments: [],
      isLoading: false,
      error: null,
      preferences: DEFAULT_PREFERENCES,
    });
  },
}));

// Selectors
export const useActiveThread = () =>
  useCoachStore((s) => s.threads.find((t) => t.id === s.activeThreadId) || null);
export const useThreads = () => useCoachStore((s) => s.threads);
export const useIsCoachLoading = () => useCoachStore((s) => s.isLoading);
export const usePendingAttachments = () => useCoachStore((s) => s.pendingAttachments);

// Context Question Selectors (Iterative)
export const useNextQuestion = () => useCoachStore((s) => s.getNextQuestion());
export const useHasEnoughContext = () => useCoachStore((s) => s.hasEnoughContext());
export const useThreadContext = () => useCoachStore((s) => s.getThreadContext());
