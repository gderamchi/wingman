
import knowledgeBase from '../data/knowledge_base.json';

// Types derived from the JSON structure
export interface KnowledgeBase {
  principles: string[];
  conversations: ConversationExample[];
}

export interface ConversationExample {
  id: string;
  title: string;
  context: string;
  lines: string[];
  tags: string[];
}

class KnowledgeService {
  private kb: KnowledgeBase;

  constructor() {
    this.kb = knowledgeBase as KnowledgeBase;
  }

  /**
   * Returns all global principles ("The Bible")
   */
  getPrinciples(): string[] {
    return this.kb.principles;
  }

  /**
   * Finds the most relevant conversation examples based on user context/query
   */
  findRelevantConversations(query: string, limit: number = 2): ConversationExample[] {
    const normalizedQuery = query.toLowerCase();

    // Simple relevance scoring
    const scored = this.kb.conversations.map(conv => {
      let score = 0;

      // Tag matching (High weight)
      conv.tags.forEach(tag => {
        if (normalizedQuery.includes(tag)) score += 5;
      });

      // Context matching (Medium weight)
      if (conv.context.toLowerCase().includes(normalizedQuery)) score += 3;

      // Content matching (Low weight, noisy)
      // Check if query keywords appear in lines (basic check)
      const keywords = normalizedQuery.split(' ').filter(w => w.length > 4);
      keywords.forEach(kw => {
        if (conv.lines.some(l => l.toLowerCase().includes(kw))) score += 1;
      });

      return { example: conv, score };
    });

    // Sort by score DESC
    scored.sort((a, b) => b.score - a.score);

    // Filter out zero scores if we have enough data, otherwise keep random backup
    // For now, return top K
    return scored.slice(0, limit).map(s => s.example);
  }

  /**
   * Formats examples for injection into LLM system prompt
   */
  formatForPrompt(examples: ConversationExample[]): string {
    if (examples.length === 0) return "";

    return examples.map(ex => `
<example>
Context: ${ex.context}
Dialogue:
${ex.lines.join('\n')}
</example>
    `).join('\n');
  }

  /**
   * Formats principles for system prompt
   */
  formatPrinciples(): string {
    return this.kb.principles.map(p => `- ${p}`).join('\n');
  }
}

export const knowledgeService = new KnowledgeService();
