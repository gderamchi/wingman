/**
 * Coach Store
 * Zustand store for thread management, messaging, and persistence
 */

import { create } from 'zustand';

import type { Message } from '@/src/core/api/blackbox';
import { blackboxAI } from '@/src/core/api/blackbox';

import * as storage from '../services/coachStorage';
import { ragClient } from '../services/ragClient';
import type {
    CoachMessage,
    CoachStoreState,
    CoachThread,
    MessageAttachment,
    UserPreferences
} from '../types';
import { buildAnalysisPrompt, buildCoachSystemPrompt, parseStructuredResponse } from './coachPrompts';

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

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
  sendImageForAnalysis: (imageBase64: string, imageUri: string, userComment?: string) => Promise<void>;

  // Attachments
  setPendingAttachment: (attachment: MessageAttachment | null) => void;
  clearPendingAttachment: () => void;

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
};

export const useCoachStore = create<CoachStoreState & CoachStoreActions>((set, get) => ({
  // Initial state
  threads: [],
  activeThreadId: null,
  pendingAttachment: null,
  isLoading: false,
  error: null,
  preferences: DEFAULT_PREFERENCES,

  // Initialize store from local storage
  // Note: We intentionally DO NOT restore activeThreadId to improve UX
  // Users should start fresh and access history via the threads list
  initialize: async () => {
    try {
      const [threads, preferences] = await Promise.all([
        storage.loadThreads(),
        storage.loadPreferences(),
      ]);

      set({
        threads,
        preferences: preferences || DEFAULT_PREFERENCES,
        activeThreadId: null, // Always start fresh for better UX
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
    };

    const threads = [newThread, ...get().threads];

    set({ threads, activeThreadId: newThread.id });

    await storage.saveThread(newThread);
    await storage.saveActiveThreadId(newThread.id);

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
        { role: 'system', content: buildCoachSystemPrompt(thread.metadata, preferences, ragContext, principles, platformContext) },
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

  // Send an image for analysis
  sendImageForAnalysis: async (imageBase64, imageUri, userComment) => {
    const { threads, activeThreadId, preferences } = get();

    // Create thread if needed
    if (!activeThreadId) {
      await get().createThread();
    }

    const thread = get().getActiveThread();
    if (!thread) return;

    // Add user message with image attachment
    const attachment: MessageAttachment = {
      id: generateId(),
      type: 'image',
      uri: imageUri,
      base64: imageBase64,
    };

    // Use user's comment if provided, otherwise use default placeholder
    const messageContent = userComment?.trim() || 'Analyse cette conversation et suggère-moi des réponses.';

    const userMessage: CoachMessage = {
      id: generateId(),
      threadId: thread.id,
      role: 'user',
      content: messageContent,
      createdAt: new Date().toISOString(),
      attachments: [attachment],
    };

    const updatedMessages = [...thread.messages, userMessage];
    const updatedThread = {
      ...thread,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    set({
      threads: threads.map((t) => (t.id === thread.id ? updatedThread : t)),
      pendingAttachment: null,
      isLoading: true,
      error: null,
    });

    try {
      // Get RAG examples with rich context (platform will be detected from image)
      const ragExamples = await ragClient.retrieveCoachingExamples({
        goal: thread.metadata.goal,
        style: thread.metadata.style,
        userMessage: userComment,
      });

      const ragContext = ragClient.formatExamplesForPrompt(ragExamples);
      const principles = ragClient.formatPrinciplesForPrompt();
      // Platform context will be auto-detected by AI, but we can provide context for common ones
      const platformContext = ragClient.formatPlatformContext(undefined); // AI will detect

      // Build analysis prompt with all context
      const systemPrompt = buildAnalysisPrompt(thread.metadata, preferences, ragContext, principles, platformContext);

      const aiMessages: Message[] = [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageBase64.startsWith('data:')
                  ? imageBase64
                  : `data:image/png;base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: userComment?.trim() || 'Analyse cette conversation et suggère-moi des réponses.',
            },
          ],
        },
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
        title: 'Analyse de conversation',
      };

      set({
        threads: get().threads.map((t) => (t.id === thread.id ? finalThread : t)),
        isLoading: false,
      });

      await storage.saveThread(finalThread);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'analyse',
      });
    }
  },

  // Set pending attachment
  setPendingAttachment: (attachment) => {
    set({ pendingAttachment: attachment });
  },

  // Clear pending attachment
  clearPendingAttachment: () => {
    set({ pendingAttachment: null });
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
      pendingAttachment: null,
      preferences: DEFAULT_PREFERENCES,
    });
  },

  // Reset store (without clearing storage)
  reset: () => {
    set({
      threads: [],
      activeThreadId: null,
      pendingAttachment: null,
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
export const usePendingAttachment = () => useCoachStore((s) => s.pendingAttachment);
