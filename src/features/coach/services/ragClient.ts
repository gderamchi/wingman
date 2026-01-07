
import { ConversationExample, knowledgeService } from './knowledgeService';

export interface RagContext {
  goal: string;
  style: string;
}

export type RetrievedExample = ConversationExample;

class RagClient {
  private enabled = true;

  constructor() {
    // Check if running in mock/local mode
    // this.enabled = ...
  }

  /**
   * Retrieve relevant coaching examples based on user context
   */
  async retrieveCoachingExamples(context: RagContext): Promise<RetrievedExample[]> {
    if (!this.enabled) return [];

    // Simulate query using context tags
    // e.g. "dating playful" -> finds conversations tagged with these or similar keywords
    const query = `${context.goal} ${context.style}`;

    // In real implementation, this would call vector DB
    // Here we use local knowledge service
    return knowledgeService.findRelevantConversations(query, 2);
  }

  /**
   * Get the global principles ("The Bible")
   */
  getPrinciples(): string[] {
    return knowledgeService.getPrinciples();
  }

  /**
   * Format examples for injection into LLM prompt
   */
  formatExamplesForPrompt(examples: RetrievedExample[]): string {
    if (examples.length === 0) return '';

    const formattedExamples = knowledgeService.formatForPrompt(examples);

    return `
EXEMPLES DE RÉFÉRENCE (LE "STATE"):
Utilise ces conversations comme modèles de style (insolent, direct, détaché):
${formattedExamples}
`;
  }

  /**
   * Format principles for injection
   */
  formatPrinciplesForPrompt(): string {
     const principles = this.getPrinciples();
     return `
PRINCIPES FONDAMENTAUX (LA BIBLE):
Respecte impérativement ces règles:
${principles.map(p => `- ${p}`).join('\n')}
`;
  }
}

export const ragClient = new RagClient();
