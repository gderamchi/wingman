/**
 * QuestionService v2
 * Iterative conversational question flow
 * Smart detection to skip questions if context already known
 */

import type {
    ContextualQuestion,
    ConversationGoal,
    DetectedPlatform,
    StructuredCoachResponse,
    TargetInfo,
    ThreadContext
} from '../types';

// ============================================================
// Question Bank - Conversational & Coherent
// ============================================================

const QUESTION_BANK: ContextualQuestion[] = [
  // PRIORITY 1: Who are we talking about?
  {
    id: 'q_relationship',
    category: 'target_identity',
    priority: 10,
    question: "Hey ! Pour te donner les meilleurs conseils, j'ai besoin de contexte 🎯\n\nC'est quoi ta relation avec cette personne ?",
    chips: [
      { id: 'match', label: '🔥 Match dating app', value: 'match' },
      { id: 'crush', label: '💕 Crush IRL', value: 'stranger' },
      { id: 'ex', label: '💔 Mon ex', value: 'ex' },
      { id: 'friend', label: '👋 Un(e) ami(e)', value: 'friend' },
      { id: 'colleague', label: '💼 Collègue', value: 'colleague' },
    ]
  },
  // PRIORITY 2: Platform (only if not detected from screenshot)
  {
    id: 'q_platform',
    category: 'target_identity',
    priority: 9,
    question: "Sur quelle app ou plateforme vous parlez ?",
    chips: [
      { id: 'tinder', label: '🔥 Tinder', value: 'tinder' },
      { id: 'bumble', label: '🐝 Bumble', value: 'bumble' },
      { id: 'hinge', label: '💜 Hinge', value: 'hinge' },
      { id: 'insta', label: '📸 Instagram', value: 'instagram' },
      { id: 'whatsapp', label: '💬 WhatsApp', value: 'whatsapp' },
      { id: 'sms', label: '📱 SMS/iMessage', value: 'sms' },
    ],
    condition: {
      excludeIf: ['detected_platform'], // Skip if platform auto-detected
    }
  },
  // PRIORITY 3: Goal - What do you want?
  {
    id: 'q_goal',
    category: 'goal',
    priority: 8,
    question: "Top ! Et c'est quoi ton objectif là ?",
    chips: [
      { id: 'date', label: '🍷 Décrocher un date', value: 'get_date' },
      { id: 'revive', label: '⚡ Relancer (ghosté)', value: 'revive' },
      { id: 'seduce', label: '🔥 Séduire / créer du désir', value: 'seduce' },
      { id: 'escape', label: '💪 Sortir de la friendzone', value: 'friendzone_escape' },
      { id: 'chill', label: '😎 Juste discuter', value: 'just_chatting' },
    ]
  },
  // PRIORITY 4: Duration (context)
  {
    id: 'q_duration',
    category: 'relationship',
    priority: 6,
    question: "Ça fait combien de temps que vous vous parlez ?",
    chips: [
      { id: 'just', label: '⚡ Tout juste', value: 'just_met' },
      { id: 'days', label: '📅 Quelques jours', value: 'days' },
      { id: 'weeks', label: '📆 Quelques semaines', value: 'weeks' },
      { id: 'months', label: '🗓️ Des mois', value: 'months' },
    ]
  },
  // PRIORITY 5: Last message (for timing strategy)
  {
    id: 'q_last_message',
    category: 'timing',
    priority: 5,
    question: "Dernier message envoyé par qui ?",
    chips: [
      { id: 'me', label: '👤 Par moi', value: 'user' },
      { id: 'them', label: '💬 Par elle/lui', value: 'target' },
    ]
  },
];

// Encouragement message to share more context
const CONTEXT_ENCOURAGEMENT = `💡 **Pro tip**: Plus tu me donnes de contexte, meilleurs seront mes conseils !
- 📸 Envoie des **screenshots** de la conversation
- 🎙️ Partage des **vocaux** si elle en envoie
- 💭 Dis-moi ton **feeling** sur la situation

Je suis là pour t'aider, balance tout !`;

// ============================================================
// Default Context Factory
// ============================================================

export function createDefaultThreadContext(): ThreadContext {
  return {
    targetInfo: {},
    conversationGoal: 'unknown',
    askedQuestionIds: [],
    answeredQuestionIds: [],
    completenessScore: 0,
  };
}

// ============================================================
// Question Service
// ============================================================

class QuestionService {
  private questionBank: ContextualQuestion[] = QUESTION_BANK;

  /**
   * Get all available questions
   */
  getAllQuestions(): ContextualQuestion[] {
    return this.questionBank;
  }

  /**
   * Get the context encouragement message
   */
  getContextEncouragement(): string {
    return CONTEXT_ENCOURAGEMENT;
  }

  /**
   * Evaluate context completeness (0-100)
   */
  evaluateContextCompleteness(context: ThreadContext): number {
    let score = 0;
    const weights = {
      relationship: 30,    // Who is this person?
      goal: 35,            // What do you want?
      platform: 15,        // Where are you talking?
      duration: 10,        // How long?
      lastMessage: 10,     // Timing context
    };

    if (context.targetInfo.relationship && context.targetInfo.relationship !== 'unknown') {
      score += weights.relationship;
    }
    if (context.conversationGoal && context.conversationGoal !== 'unknown') {
      score += weights.goal;
    }
    if (context.targetInfo.platform) {
      score += weights.platform;
    }
    if (context.targetInfo.knownDuration) {
      score += weights.duration;
    }
    if (context.lastMessageFrom) {
      score += weights.lastMessage;
    }

    return Math.min(100, score);
  }

  /**
   * Check if we have enough context to give advice
   * Minimum: relationship + goal = 65% context
   */
  hasEnoughContext(context: ThreadContext): boolean {
    const hasRelationship = context.targetInfo.relationship && context.targetInfo.relationship !== 'unknown';
    const hasGoal = context.conversationGoal && context.conversationGoal !== 'unknown';
    return !!(hasRelationship && hasGoal);
  }

  /**
   * Get the NEXT question to ask (iterative, one at a time)
   * Returns null if no more questions needed
   */
  getNextQuestion(context: ThreadContext): ContextualQuestion | null {
    // If we have enough context, no more questions
    if (this.hasEnoughContext(context)) {
      return null;
    }

    // Filter out already answered questions
    const unanswered = this.questionBank.filter(
      q => !context.answeredQuestionIds.includes(q.id)
    );

    // Filter based on conditions (e.g., skip platform if auto-detected)
    const eligible = unanswered.filter(q => {
      if (!q.condition) return true;

      // Check exclusions
      if (q.condition.excludeIf) {
        const hasExclusion = q.condition.excludeIf.some(
          exId => context.answeredQuestionIds.includes(exId)
        );
        if (hasExclusion) return false;
      }

      // Check required prerequisites
      if (q.condition.requires) {
        const hasAllRequired = q.condition.requires.every(
          reqId => context.answeredQuestionIds.includes(reqId)
        );
        if (!hasAllRequired) return false;
      }

      return true;
    });

    // Sort by priority and return the first one
    if (eligible.length === 0) return null;
    eligible.sort((a, b) => b.priority - a.priority);
    return eligible[0];
  }

  /**
   * Update context from AI structured response (auto-detect from analysis)
   * This allows skipping questions if the AI already detected the info
   */
  updateContextFromAnalysis(
    context: ThreadContext,
    analysis: StructuredCoachResponse
  ): ThreadContext {
    const newContext: ThreadContext = {
      ...context,
      targetInfo: { ...context.targetInfo },
      answeredQuestionIds: [...context.answeredQuestionIds],
    };

    // Auto-detect platform from analysis
    if (analysis.detectedPlatform && !newContext.targetInfo.platform) {
      newContext.targetInfo.platform = analysis.detectedPlatform;
      // Mark platform question as answered so it's skipped
      if (!newContext.answeredQuestionIds.includes('detected_platform')) {
        newContext.answeredQuestionIds.push('detected_platform');
      }
    }

    // Auto-detect conversation stage and map to goal hint
    if (analysis.contextSummary?.stage && !newContext.conversationGoal) {
      const stageToGoalHint: Record<string, string> = {
        'initial_contact': 'Hook attention',
        'getting_to_know': 'Build rapport',
        'date_proposal': 'get_date',
        'ghosted': 'revive',
        'revival': 'revive',
      };
      // We don't auto-set goal, but could use for smarter suggestions
    }

    // Recalculate completeness
    newContext.completenessScore = this.evaluateContextCompleteness(newContext);

    return newContext;
  }

  /**
   * Process an answer and update the context
   */
  processAnswer(
    context: ThreadContext,
    questionId: string,
    answer: string
  ): ThreadContext {
    const newContext: ThreadContext = {
      ...context,
      targetInfo: { ...context.targetInfo },
      answeredQuestionIds: [...context.answeredQuestionIds, questionId],
    };

    // Map answers to context fields
    switch (questionId) {
      case 'q_relationship':
        newContext.targetInfo.relationship = answer as TargetInfo['relationship'];
        break;
      case 'q_platform':
        newContext.targetInfo.platform = answer as DetectedPlatform;
        break;
      case 'q_duration':
        newContext.targetInfo.knownDuration = answer as TargetInfo['knownDuration'];
        break;
      case 'q_goal':
        newContext.conversationGoal = answer as ConversationGoal;
        break;
      case 'q_last_message':
        newContext.lastMessageFrom = answer as 'user' | 'target';
        break;
    }

    // Recalculate completeness
    newContext.completenessScore = this.evaluateContextCompleteness(newContext);

    return newContext;
  }

  /**
   * Format context for prompt injection
   */
  formatContextForPrompt(context: ThreadContext): string {
    if (!context || context.completenessScore < 20) {
      return `⚠️ CONTEXTE NON ÉTABLI - Des questions sont en cours pour établir le contexte.`;
    }

    const parts: string[] = ['✅ CONTEXTE CONFIRMÉ PAR L\'UTILISATEUR:'];

    if (context.targetInfo.relationship) {
      const relationLabels: Record<string, string> = {
        match: 'Match sur app de dating',
        friend: 'Ami(e)',
        colleague: 'Collègue',
        stranger: 'Rencontre IRL / Crush',
        ex: 'Ex',
        unknown: 'Non spécifié',
      };
      parts.push(`- Relation: ${relationLabels[context.targetInfo.relationship] || context.targetInfo.relationship}`);
    }

    if (context.targetInfo.platform) {
      parts.push(`- Plateforme: ${context.targetInfo.platform.charAt(0).toUpperCase() + context.targetInfo.platform.slice(1)}`);
    }

    if (context.conversationGoal && context.conversationGoal !== 'unknown') {
      const goalLabels: Record<string, string> = {
        get_date: 'Obtenir un date',
        revive: 'Relancer après silence/ghost',
        seduce: 'Créer du désir / séduire',
        friendzone_escape: 'Sortir de la friendzone',
        just_chatting: 'Discussion légère',
      };
      parts.push(`- Objectif: ${goalLabels[context.conversationGoal] || context.conversationGoal}`);
    }

    if (context.targetInfo.knownDuration) {
      const durationLabels: Record<string, string> = {
        just_met: 'Vient de matcher/se rencontrer',
        days: 'Quelques jours',
        weeks: 'Quelques semaines',
        months: 'Plusieurs mois',
        years: 'Des années',
      };
      parts.push(`- Depuis: ${durationLabels[context.targetInfo.knownDuration]}`);
    }

    if (context.lastMessageFrom) {
      parts.push(`- Dernier message: ${context.lastMessageFrom === 'user' ? "Envoyé par l'utilisateur" : "Envoyé par l'autre"}`);
    }

    return parts.join('\n');
  }

  /**
   * Generate the question as a coach message content
   * Returns a structured response with the question and chips
   */
  formatQuestionAsMessage(question: ContextualQuestion, isFirstQuestion: boolean): StructuredCoachResponse {
    return {
      type: 'structured',
      contextSummary: {
        summary: isFirstQuestion ? CONTEXT_ENCOURAGEMENT : '',
        dynamic: '',
        stage: 'initial_contact',
        mainRisk: '',
      },
      clarificationQuestions: [{
        id: question.id,
        question: question.question,
        chips: question.chips,
      }],
      replySuggestions: [], // No suggestions until context is established
    };
  }
}

export const questionService = new QuestionService();
