/**
 * RAG Client
 * Facade for knowledge retrieval and prompt formatting
 */

import {
    knowledgeService,
    type Conversation,
    type Principle,
    type RetrievalContext
} from './knowledgeService';

export type { RetrievalContext } from './knowledgeService';
export type RetrievedExample = Conversation;

class RagClient {
  private enabled = true;

  constructor() {
    // Check if running in mock/local mode
    // this.enabled = ...
  }

  /**
   * Retrieve relevant coaching examples based on rich context
   */
  async retrieveCoachingExamples(context: RetrievalContext): Promise<Conversation[]> {
    if (!this.enabled) return [];
    return knowledgeService.findRelevantConversations(context, 3);
  }

  /**
   * Get the indexed principles ("The Bible")
   */
  getPrinciples(): Principle[] {
    return knowledgeService.getPrinciples();
  }

  /**
   * Get principle by ID for citation
   */
  getPrincipleById(id: string): Principle | undefined {
    return knowledgeService.getPrincipleById(id);
  }

  /**
   * Format principles for injection into LLM prompt (with IDs)
   */
  formatPrinciplesForPrompt(): string {
    const principles = this.getPrinciples();
    return `
PRINCIPES FONDAMENTAUX (LA BIBLE):
Chaque suggestion de réponse DOIT citer les principes appliqués par leur ID (ex: [P01], [P05]).
${principles.map(p => `[${p.id}] ${p.shortName}: ${p.text}`).join('\n')}
`;
  }

  /**
   * Format examples for injection into LLM prompt
   */
  formatExamplesForPrompt(examples: Conversation[]): string {
    if (examples.length === 0) return '';

    const formattedExamples = knowledgeService.formatForPrompt(examples);

    return `
EXEMPLES DE RÉFÉRENCE (LE "STATE"):
Ces conversations montrent le style à suivre (insolent, direct, détaché):
${formattedExamples}
`;
  }

  /**
   * Format platform-specific context
   */
  formatPlatformContext(platform?: string): string {
    if (!platform) return '';
    return knowledgeService.formatPlatformContext(platform);
  }

  /**
   * Detect platform from image analysis result
   */
  detectPlatformFromUI(uiDescription: string): string | undefined {
    const lower = uiDescription.toLowerCase();
    if (lower.includes('tinder') || lower.includes('flame') || lower.includes('swipe')) return 'tinder';
    if (lower.includes('whatsapp') || lower.includes('vert clair') || lower.includes('green bubbles')) return 'whatsapp';
    if (lower.includes('instagram') || lower.includes('dm') || lower.includes('story reply')) return 'instagram';
    if (lower.includes('bumble') || lower.includes('hinge')) return 'tinder'; // Similar dynamics
    return undefined;
  }
}

export const ragClient = new RagClient();
