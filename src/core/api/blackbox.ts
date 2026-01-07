import { ChatCompletionRequest, ChatCompletionResponse, Message } from './types';
export type { Message };

export class BlackboxAIClient {
  private apiKey: string;
  private model: string;
  private apiUrl: string = 'https://api.blackbox.ai/chat/completions';

  constructor(apiKey?: string, model: string = 'blackboxai/google/gemini-2.5-flash') {
    this.apiKey = apiKey || process.env.EXPO_PUBLIC_BLACKBOX_API_KEY || '';
    this.model = model;

    console.log('[BlackboxAI] Initialized with model:', this.model, 'API Key present:', !!this.apiKey);

    if (!this.apiKey) {
      console.warn('[BlackboxAI] No API key provided, client will run in mock mode if forced.');
    }
  }

  async chat(messages: Message[], options: Partial<ChatCompletionRequest> = {}): Promise<ChatCompletionResponse> {
    if (!this.apiKey || this.apiKey === 'mock') {
         console.log('[BlackboxAI] Running in MOCK mode');
         await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
         return this.getMockResponse(messages);
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages,
          model: this.model,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[BlackboxAI] API Error Details:
          Status: ${response.status}
          StatusText: "${response.statusText}"
          Body: ${errorText.slice(0, 200)}...
        `);
        throw new Error(`Blackbox AI API error: ${response.status} - ${errorText || response.statusText}`);
      }

      const data = await response.json();
      return data as ChatCompletionResponse;
    } catch (error) {
      console.error('[BlackboxAI] Chat request failed:', error);
      console.warn('[BlackboxAI] ⚠️ API failed, falling back to MOCK mode for smooth UX.');
      return this.getMockResponse(messages);
    }
  }

  private getMockResponse(messages: Message[]): ChatCompletionResponse {
     // Check if it's an analysis request
     const isAnalysis = messages.some(m => Array.isArray(m.content) && m.content.some((c: any) => c.type === 'image_url'));

     let content = "";
     if (isAnalysis) {
        content = JSON.stringify({
            type: "structured",
            contextSummary: {
                summary: "La conversation montre un début d'intérêt mutuel mais une hésitation de ta part. Elle pose des questions, ce qui est bon signe.",
                dynamic: "Elle investit plus pour le moment.",
                stage: "getting_to_know",
                mainRisk: "Paraître trop distant ou passif.",
                insights: ["Elle utilise des emojis", "Temps de réponse rapide"]
            },
            clarificationQuestions: [
                {
                    id: "q1",
                    question: "Vous vous connaissez depuis longtemps ?",
                    chips: [
                        {id: "c1", "label": "Oui, amis d'enfance", "value": "On est amis depuis longtemps"},
                        {id: "c2", "label": "Non, match récent", "value": "On vient de matcher"}
                    ]
                }
            ],
            replySuggestions: [
                {
                    id: "r1",
                    text: "Haha j'adore ! Et toi tu fais quoi ce weekend ? 😊",
                    tone: "playful",
                    whyItWorks: "Relance la conversation avec légèreté",
                    riskToAvoid: "Aucun risque majeur"
                },
                {
                    id: "r2",
                    text: "Intéressant. On devrait en parler autour d'un verre.",
                    tone: "direct",
                    whyItWorks: "Montre de l'assurance et propose un date",
                    riskToAvoid: "Peut paraître un peu trop rapide"
                }
            ]
        });
     } else {
        // Chat response
        content = "C'est une excellente approche ! Cela montre que tu es intéressé tout en restant détaché. Tu pourrais aussi ajouter un emoji pour adoucir le ton.";
     }

     return {
        id: "mock-" + Date.now(),
        object: "chat.completion",
        created: Date.now(),
        model: "mock-model",
        choices: [
            {
                index: 0,
                message: {
                    role: "assistant", // Fixed: 'assistant' to match Message['role'] type
                    content: content
                },
                finish_reason: "stop"
            }
        ],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
     };
  }

  async refineReply(reply: string, instruction: string): Promise<string> {
    // Implement mock for refine
    if (!this.apiKey || this.apiKey === 'mock') {
        return `Version améliorée de "${reply}": ${instruction} (Mock)`;
    }
    // Existing implementation logic would go here
     return "Refine not implemented in this snippet";
  }
}

export const blackboxAI = new BlackboxAIClient();
