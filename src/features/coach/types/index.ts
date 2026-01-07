/**
 * Coach Feature Types
 * Type definitions for the ChatGPT-like coach interface
 */

// ============================================================
// Thread & Message Types
// ============================================================

export interface CoachThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: CoachMessage[];
  metadata: ThreadMetadata;
  /** Proactive question system context */
  context?: ThreadContext;
}

export interface ThreadMetadata {
  /** User's goal for this conversation */
  goal: 'dating' | 'social' | 'professional';
  /** Preferred communication style */
  style: 'playful' | 'direct' | 'empathetic';
  /** Outcome of the conversation if tracked */
  outcome?: ConversationOutcome;
}

export interface CoachMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
  createdAt: string;
  /** Attachments (images) */
  attachments?: MessageAttachment[];
  /** User feedback on this message */
  feedback?: UserFeedback;
}

export interface UserFeedback {
  rating: 'helpful' | 'not_helpful';
  reason?: string;
  createdAt: string;
}

export type MessageContent =
  | string
  | StructuredCoachResponse;

export interface MessageAttachment {
  id: string;
  type: 'image' | 'audio';
  uri: string;
  /** Base64 for sending to AI */
  base64?: string;
  /** Thumbnail for display */
  thumbnailUri?: string;
  /** Audio specific metadata */
  mimeType?: string;
  duration?: number;
  fileName?: string;
}

// ============================================================
// Structured Coach Response Types
// ============================================================

export interface StructuredCoachResponse {
  type: 'structured';
  /** Detected platform from screenshot */
  detectedPlatform?: DetectedPlatform;
  /** Detected language from conversation */
  detectedLanguage?: DetectedLanguage;
  /** Context analysis summary */
  contextSummary: ContextSummary;
  /** Clarification questions (max 3-5 per turn) */
  clarificationQuestions?: ClarificationQuestion[];
  /** Ready-to-send reply suggestions (3-4) */
  replySuggestions?: ReadyReply[];
  /** Outcome tracking prompt */
  outcomePrompt?: OutcomePrompt;
}

export type DetectedPlatform = 'tinder' | 'whatsapp' | 'instagram' | 'bumble' | 'hinge' | 'sms' | 'other';
export type DetectedLanguage = 'fr' | 'en' | 'es' | 'it' | 'other';

export interface ContextSummary {
  /** Brief summary of the conversation dynamic (2-4 lines) */
  summary: string;
  /** Who's investing more, interest levels */
  dynamic: string;
  /** Conversation stage */
  stage: ConversationStage;
  /** Main risk identified */
  mainRisk: string;
  /** Key insights as bullet points */
  insights?: string[];
}

export type ConversationStage =
  | 'initial_contact'
  | 'getting_to_know'
  | 'revival'
  | 'post_seen'
  | 'ghosted'
  | 'date_proposal'
  | 'post_date'
  | 'other';

export interface ClarificationQuestion {
  id: string;
  /** The question text */
  question: string;
  /** Quick-answer chip options */
  chips: QuickChipData[];
}

// ============================================================
// Thread Context Types (Proactive Question System)
// ============================================================

export interface TargetInfo {
  name?: string;
  platform?: DetectedPlatform;
  relationship?: 'match' | 'friend' | 'colleague' | 'stranger' | 'ex' | 'unknown';
  knownDuration?: 'just_met' | 'days' | 'weeks' | 'months' | 'years';
  firstContact?: 'app' | 'irl' | 'social_media' | 'through_friends';
}

export type ConversationGoal =
  | 'get_date'
  | 'revive'
  | 'seduce'
  | 'friendzone_escape'
  | 'just_chatting'
  | 'unknown';

export interface ThreadContext {
  /** Information about the target person */
  targetInfo: TargetInfo;
  /** User's goal for this conversation */
  conversationGoal: ConversationGoal;
  /** Who sent the last message */
  lastMessageFrom?: 'user' | 'target';
  /** How urgent is the response needed */
  urgency?: 'immediate' | 'today' | 'no_rush';
  /** IDs of questions already asked */
  askedQuestionIds: string[];
  /** IDs of questions that were answered */
  answeredQuestionIds: string[];
  /** Completeness score (0-100) */
  completenessScore: number;
}

export interface ContextualQuestion {
  id: string;
  category: 'target_identity' | 'relationship' | 'goal' | 'timing' | 'history';
  priority: number; // 1-10, higher = more important
  question: string;
  chips: QuickChipData[];
  /** Condition for asking this question */
  condition?: {
    requires?: string[]; // IDs of questions that must be answered first
    excludeIf?: string[]; // Don't ask if these questions were answered
  };
}

export interface QuickChipData {
  id: string;
  label: string;
  /** Value sent when chip is tapped */
  value: string;
}

export interface ReadyReply {
  id: string;
  /** The actual reply text to send */
  text: string;
  /** Tone indicator */
  tone: ReplyTone;
  /** Principle IDs applied in this suggestion */
  principleIds?: string[];
  /** Why this reply works (1 line) */
  whyItWorks: string;
  /** Risk to avoid (1 line) */
  riskToAvoid: string;
}

export type ReplyTone =
  | 'soft'
  | 'direct'
  | 'playful'
  | 'serious'
  | 'flirty'
  | 'casual';

// ============================================================
// Outcome Tracking Types
// ============================================================

export interface OutcomePrompt {
  /** Question asking about outcome */
  question: string;
  /** Options for the user */
  options: OutcomeOption[];
}

export interface OutcomeOption {
  id: string;
  label: string;
  emoji?: string;
  value: OutcomeValue;
}

export type OutcomeValue = 'sent' | 'saved' | 'discarded' | 'continue_later';

export interface ConversationOutcome {
  /** What user did with the reply */
  action: OutcomeValue;
  /** Result after sending (if applicable) */
  result?: 'positive' | 'neutral' | 'negative';
  /** User's notes about what happened */
  notes?: string;
  /** Timestamp */
  recordedAt: string;
}

// ============================================================
// User Preferences (Memory)
// ============================================================

export interface UserPreferences {
  /** Preferred tone */
  defaultTone: ReplyTone;
  /** Preferred reply length */
  replyLength: 'short' | 'medium' | 'long';
  /** Whether user prefers emojis */
  useEmojis: boolean;
  /** Custom preferences confirmed by user */
  customPreferences?: string[];
  /** Interface language for advice (independent of conversation language) */
  interfaceLanguage: 'fr' | 'en';
}

// ============================================================
// RAG Types (Placeholder)
// ============================================================

export interface RetrievedExample {
  /** Unique ID */
  id: string;
  /** Context where this example worked */
  context: string;
  /** The successful reply */
  reply: string;
  /** Why it worked */
  reasoning: string;
  /** Relevance score (0-1) */
  score: number;
}

// ============================================================
// Store State Types
// ============================================================

export interface CoachStoreState {
  /** All threads */
  threads: CoachThread[];
  /** Currently active thread ID */
  activeThreadId: string | null;
  /** Pending attachments (before send) */
  pendingAttachments: MessageAttachment[];
  /** Is AI currently responding */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** User preferences */
  preferences: UserPreferences;
}
