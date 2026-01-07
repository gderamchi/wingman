/**
 * Knowledge Service
 * Provides retrieval methods for the enhanced knowledge base
 */

import knowledgeBase from '../data/knowledge_base.json';

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

export interface KnowledgeBase {
  principles: string[];
  conversations: Conversation[];
  stats: {
    totalConversations: number;
    sources: { [key: string]: number };
    generatedAt: string;
  };
}

class KnowledgeService {
  private kb: KnowledgeBase;

  constructor() {
    this.kb = knowledgeBase as unknown as KnowledgeBase;
  }

  /**
   * Returns all global principles ("The Bible")
   */
  getPrinciples(): string[] {
    return this.kb.principles;
  }

  /**
   * Finds the most relevant conversation examples based on query
   * Uses keyword matching on context, platform, and tags
   */
  findRelevantConversations(query: string, limit: number = 2): Conversation[] {
    const normalizedQuery = query.toLowerCase();
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 3);

    // Score each conversation
    const scored = this.kb.conversations.map(conv => {
      let score = 0;

      // Platform exact match (high weight)
      if (normalizedQuery.includes(conv.platform)) score += 10;

      // Tag matching (high weight)
      conv.tags.forEach(tag => {
        if (normalizedQuery.includes(tag)) score += 5;
      });

      // Context keyword matching (medium weight)
      const contextLower = conv.context.toLowerCase();
      queryWords.forEach(word => {
        if (contextLower.includes(word)) score += 3;
      });

      // Outcome matching
      if (normalizedQuery.includes('date') && conv.outcome === 'date') score += 4;
      if (normalizedQuery.includes('sex') && conv.outcome === 'full_close') score += 4;

      // Boost conversations with analysis (they're more valuable)
      if (conv.analysis) score += 2;

      // Content matching (low weight, expensive)
      const contentStr = conv.lines.join(' ').toLowerCase();
      queryWords.forEach(word => {
        if (contentStr.includes(word)) score += 1;
      });

      return { example: conv, score };
    });

    // Sort by score DESC
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(s => s.example);
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
   * Format examples for injection into LLM prompt
   */
  formatForPrompt(examples: Conversation[]): string {
    if (examples.length === 0) return '';

    return examples.map(ex => `
<exemple source="${ex.source}" platform="${ex.platform}" outcome="${ex.outcome}">
Contexte: ${ex.context}
Dialogue:
${ex.lines.slice(0, 30).join('\n')}
${ex.analysis ? `\nAnalyse:\n${ex.analysis.slice(0, 500)}...` : ''}
</exemple>
    `).join('\n');
  }

  /**
   * Format principles for system prompt
   */
  formatPrinciples(): string {
    return this.kb.principles.map(p => `- ${p}`).join('\n');
  }

  /**
   * Get stats about the knowledge base
   */
  getStats() {
    return this.kb.stats;
  }
}

export const knowledgeService = new KnowledgeService();
