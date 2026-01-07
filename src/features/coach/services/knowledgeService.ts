/**
 * Knowledge Service
 * Provides retrieval methods for the enhanced knowledge base
 */

import knowledgeBase from '../data/knowledge_base.json';

export interface Principle {
  id: string;           // P01, P02, etc.
  text: string;         // Full principle text
  shortName: string;    // Brief label for UI
  category: 'style' | 'timing' | 'mindset' | 'content' | 'logistics';
}

export interface Conversation {
  id: string;
  source: string;
  platform: string;
  outcome: string;
  context: string;
  lines: string[];
  analysis?: string;
  tags: string[];
}

export interface PlatformContext {
  name: string;
  characteristics: string[];
  commonMistakes: string[];
}

export interface KnowledgeBase {
  principles: Principle[];
  platforms: { [key: string]: PlatformContext };
  conversations: Conversation[];
  stats: {
    totalConversations: number;
    totalPrinciples: number;
    sources: { [key: string]: number };
    generatedAt: string;
  };
}

// Retrieval context for smart matching
export interface RetrievalContext {
  goal: string;           // dating, social, professional
  style: string;          // playful, direct, empathetic
  platform?: string;      // tinder, whatsapp, instagram, street
  stage?: string;         // initial, ghosted, date_proposal
  userMessage?: string;   // actual user query for content matching
}

// Legacy alias
export type ConversationExample = Conversation;

class KnowledgeService {
  private kb: KnowledgeBase;

  constructor() {
    this.kb = knowledgeBase as unknown as KnowledgeBase;
  }

  /**
   * Returns all indexed principles
   */
  getPrinciples(): Principle[] {
    return this.kb.principles;
  }

  /**
   * Get principle by ID (e.g., "P01")
   */
  getPrincipleById(id: string): Principle | undefined {
    return this.kb.principles.find(p => p.id === id);
  }

  /**
   * Get principles by category
   */
  getPrinciplesByCategory(category: Principle['category']): Principle[] {
    return this.kb.principles.filter(p => p.category === category);
  }

  /**
   * Get platform-specific context
   */
  getPlatformContext(platform: string): PlatformContext | undefined {
    return this.kb.platforms[platform];
  }

  /**
   * Get all available platforms
   */
  getAvailablePlatforms(): string[] {
    return Object.keys(this.kb.platforms);
  }

  /**
   * Enhanced retrieval with multi-factor scoring
   */
  findRelevantConversations(context: RetrievalContext, limit: number = 3): Conversation[] {
    const WEIGHTS = {
      platformMatch: 15,    // Same platform = very relevant
      outcomeSuccess: 10,   // Successful outcomes (date, FC)
      hasAnalysis: 8,       // Analyzed examples are gold
      stageMatch: 6,        // Same conversation stage (if detectable)
      tagMatch: 3,          // General tag overlap
      contentMatch: 1,      // Word overlap in lines
    };

    const queryWords = (context.userMessage || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);

    const scored = this.kb.conversations.map(conv => {
      let score = 0;

      // Platform exact match (high weight)
      if (context.platform && conv.platform === context.platform) {
        score += WEIGHTS.platformMatch;
      }

      // Successful outcome bonus
      if (conv.outcome === 'date' || conv.outcome === 'full_close') {
        score += WEIGHTS.outcomeSuccess;
      }

      // Has deep analysis = more valuable
      if (conv.analysis) {
        score += WEIGHTS.hasAnalysis;
      }

      // Stage matching (from context or tags)
      if (context.stage) {
        const stageTags = ['ghosted', 'date', 'initial'];
        if (conv.tags.some(t => t.includes(context.stage!))) {
          score += WEIGHTS.stageMatch;
        }
      }

      // Tag matching with goal/style
      const searchTerms = [context.goal, context.style].filter(Boolean);
      searchTerms.forEach(term => {
        if (conv.tags.some(t => t.includes(term))) {
          score += WEIGHTS.tagMatch;
        }
      });

      // Content matching (expensive but thorough)
      if (queryWords.length > 0) {
        const contentStr = conv.lines.join(' ').toLowerCase();
        queryWords.forEach(word => {
          if (contentStr.includes(word)) score += WEIGHTS.contentMatch;
        });
      }

      return { conv, score };
    });

    // Sort by score DESC
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(s => s.conv);
  }

  /**
   * Get conversations that have analysis annotations (high-value examples)
   */
  getAnalyzedExamples(limit: number = 3): Conversation[] {
    return this.kb.conversations
      .filter(c => c.analysis)
      .slice(0, limit);
  }

  /**
   * Filter conversations by platform
   */
  getByPlatform(platform: string): Conversation[] {
    return this.kb.conversations.filter(c => c.platform === platform);
  }

  /**
   * Format principles for injection into LLM prompt with IDs
   */
  formatPrinciples(): string {
    return this.kb.principles
      .map(p => `[${p.id}] ${p.text}`)
      .join('\n');
  }

  /**
   * Format platform context for prompt injection
   */
  formatPlatformContext(platform: string): string {
    const ctx = this.kb.platforms[platform];
    if (!ctx) return '';

    return `
CONTEXTE PLATEFORME (${ctx.name}):
Caractéristiques:
${ctx.characteristics.map(c => `- ${c}`).join('\n')}

Erreurs courantes à éviter:
${ctx.commonMistakes.map(m => `- ❌ ${m}`).join('\n')}
`;
  }

  /**
   * Format examples for injection into LLM prompt
   */
  formatForPrompt(examples: Conversation[]): string {
    if (examples.length === 0) return '';

    return examples.map(ex => `
<exemple source="${ex.source}" platform="${ex.platform}" outcome="${ex.outcome}">
Contexte: ${ex.context}
Dialogue:
${ex.lines.slice(0, 25).join('\n')}
${ex.analysis ? `\nAnalyse tactique:\n${ex.analysis.slice(0, 400)}...` : ''}
</exemple>
    `).join('\n');
  }

  /**
   * Get stats about the knowledge base
   */
  getStats() {
    return this.kb.stats;
  }
}

export const knowledgeService = new KnowledgeService();
