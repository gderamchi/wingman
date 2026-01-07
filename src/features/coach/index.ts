/**
 * Coach Feature
 * Export all coach-related modules
 */

// Types
export * from './types';

// Store
export { useActiveThread, useCoachStore, useIsCoachLoading, usePendingAttachments, useThreads } from './stores/coachStore';

// Services
export { ragClient } from './services/ragClient';

// Components
export * from './components';
