/**
 * Coach Storage Service
 * Local persistence layer using AsyncStorage for threads and preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CoachThread, UserPreferences } from '../types';

const STORAGE_KEYS = {
  THREADS: '@wingman/coach/threads',
  PREFERENCES: '@wingman/coach/preferences',
  ACTIVE_THREAD: '@wingman/coach/active_thread',
} as const;

/**
 * Save all threads to local storage
 */
export async function saveThreads(threads: CoachThread[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(threads));
  } catch (error) {
    console.error('[CoachStorage] Failed to save threads:', error);
    throw error;
  }
}

/**
 * Load all threads from local storage
 */
export async function loadThreads(): Promise<CoachThread[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.THREADS);
    if (!data) return [];
    return JSON.parse(data) as CoachThread[];
  } catch (error) {
    console.error('[CoachStorage] Failed to load threads:', error);
    return [];
  }
}

/**
 * Save a single thread (updates or inserts)
 */
export async function saveThread(thread: CoachThread): Promise<void> {
  try {
    const threads = await loadThreads();
    const existingIndex = threads.findIndex((t) => t.id === thread.id);

    if (existingIndex >= 0) {
      threads[existingIndex] = thread;
    } else {
      threads.unshift(thread); // Add new threads at the beginning
    }

    await saveThreads(threads);
  } catch (error) {
    console.error('[CoachStorage] Failed to save thread:', error);
    throw error;
  }
}

/**
 * Delete a thread by ID
 */
export async function deleteThread(threadId: string): Promise<void> {
  try {
    const threads = await loadThreads();
    const filtered = threads.filter((t) => t.id !== threadId);
    await saveThreads(filtered);
  } catch (error) {
    console.error('[CoachStorage] Failed to delete thread:', error);
    throw error;
  }
}

/**
 * Save user preferences
 */
export async function savePreferences(preferences: UserPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error('[CoachStorage] Failed to save preferences:', error);
    throw error;
  }
}

/**
 * Load user preferences
 */
export async function loadPreferences(): Promise<UserPreferences | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!data) return null;
    return JSON.parse(data) as UserPreferences;
  } catch (error) {
    console.error('[CoachStorage] Failed to load preferences:', error);
    return null;
  }
}

/**
 * Save active thread ID
 */
export async function saveActiveThreadId(threadId: string | null): Promise<void> {
  try {
    if (threadId) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_THREAD, threadId);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_THREAD);
    }
  } catch (error) {
    console.error('[CoachStorage] Failed to save active thread ID:', error);
  }
}

/**
 * Load active thread ID
 */
export async function loadActiveThreadId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_THREAD);
  } catch (error) {
    console.error('[CoachStorage] Failed to load active thread ID:', error);
    return null;
  }
}

/**
 * Clear all coach data (for "delete my data" feature)
 */
export async function clearAllCoachData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.THREADS,
      STORAGE_KEYS.PREFERENCES,
      STORAGE_KEYS.ACTIVE_THREAD,
    ]);
  } catch (error) {
    console.error('[CoachStorage] Failed to clear all data:', error);
    throw error;
  }
}
