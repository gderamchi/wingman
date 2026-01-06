/**
 * Blackbox AI Client
 * Uses OpenAI-compatible API to access Gemini 2.5 Flash via Blackbox AI
 */

const BLACKBOX_API_URL = "https://api.blackbox.ai/v1/chat/completions";
const BLACKBOX_API_KEY = process.env.EXPO_PUBLIC_BLACKBOX_API_KEY ?? "";

// Model to use - Gemini 2.5 Flash via Blackbox
const MODEL = "blackboxai/google/gemini-2.5-flash";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string | MessageContent[];
}

export interface MessageContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string; // base64 data URL or HTTP URL
  };
}

export interface ChatCompletionRequest {
  model?: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class BlackboxAIClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(
    apiKey: string = BLACKBOX_API_KEY,
    baseUrl: string = BLACKBOX_API_URL,
    model: string = MODEL
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async chat(
    messages: Message[],
    options: Partial<ChatCompletionRequest> = {}
  ): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      throw new Error(
        "Blackbox API key not configured. Set EXPO_PUBLIC_BLACKBOX_API_KEY."
      );
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2048,
        stream: options.stream ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Blackbox AI API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Analyze a conversation screenshot and generate reply suggestions
   */
  async analyzeConversation(
    imageBase64: string,
    context: AnalysisContext
  ): Promise<AnalysisResult> {
    const systemPrompt = this.buildSystemPrompt(context);
    const userMessage = this.buildUserMessage(imageBase64, context);

    const response = await this.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ]);

    return this.parseAnalysisResponse(response.choices[0].message.content);
  }

  /**
   * Refine a reply based on user feedback
   */
  async refineReply(
    originalReply: string,
    feedback: string,
    context: AnalysisContext
  ): Promise<string> {
    const response = await this.chat([
      {
        role: "system",
        content: `Tu es un expert en communication. L'utilisateur veut améliorer sa réponse.
Contexte: ${context.goal} - Style: ${context.style}
Réponse originale: "${originalReply}"

Affine cette réponse selon le feedback de l'utilisateur. Réponds directement avec la réponse améliorée, sans explication.`,
      },
      { role: "user", content: feedback },
    ]);

    return response.choices[0].message.content;
  }

  public buildSystemPrompt(context: AnalysisContext): string {
    const goalDescriptions: Record<string, string> = {
      dating: "rencontres amoureuses et séduction",
      social: "relations amicales et sociales",
      professional: "contexte professionnel et networking",
    };

    const styleDescriptions: Record<string, string> = {
      playful: "léger et taquin",
      direct: "direct et efficace",
      empathetic: "empathique et à l'écoute",
    };

    return `Tu es Wingman, un coach de conversation expert. Tu analyses des captures d'écran de conversations et suggères des réponses optimales.

CONTEXTE DE L'UTILISATEUR:
- Objectif: ${goalDescriptions[context.goal] ?? context.goal}
- Style préféré: ${styleDescriptions[context.style] ?? context.style}
${context.additionalContext ? `- Contexte additionnel: ${context.additionalContext}` : ""}

INSTRUCTIONS:
1. Analyse la conversation visible dans l'image
2. Identifie le contexte émotionnel et les dynamiques
3. Génère 3 suggestions de réponses adaptées au style demandé
4. Pour chaque suggestion, indique brièvement pourquoi elle fonctionne

RÉPONDS EN JSON VALIDE avec la structure:
{
  "analysis": {
    "conversationSummary": "résumé de la conversation",
    "emotionalContext": "analyse du contexte émotionnel",
    "keyInsights": ["observation 1", "observation 2"]
  },
  "suggestions": [
    {
      "text": "texte de la réponse suggérée",
      "tone": "playful|direct|empathetic|etc",
      "reasoning": "pourquoi cette réponse fonctionne"
    }
  ]
}`;
  }

  public buildUserMessage(
    imageBase64: string,
    context: AnalysisContext
  ): MessageContent[] {
    const content: MessageContent[] = [
      {
        type: "image_url",
        image_url: {
          url: imageBase64.startsWith("data:")
            ? imageBase64
            : `data:image/png;base64,${imageBase64}`,
        },
      },
      {
        type: "text",
        text: context.userQuestion ?? "Analyse cette conversation et suggère-moi des réponses.",
      },
    ];

    return content;
  }

  public parseAnalysisResponse(content: string): AnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Fallback if parsing fails
      return {
        analysis: {
          conversationSummary: "Analyse non disponible",
          emotionalContext: "Contexte non déterminé",
          keyInsights: [],
        },
        suggestions: [
          {
            text: content,
            tone: "direct",
            reasoning: "Réponse générée par l'IA",
          },
        ],
      };
    }
  }
}

// Types
export interface AnalysisContext {
  goal: "dating" | "social" | "professional";
  style: "playful" | "direct" | "empathetic";
  additionalContext?: string;
  userQuestion?: string;
}

export interface AnalysisResult {
  analysis: {
    conversationSummary: string;
    emotionalContext: string;
    keyInsights: string[];
  };
  suggestions: ReplySuggestion[];
}

export interface ReplySuggestion {
  text: string;
  tone: string;
  reasoning: string;
}

// Singleton instance
export const blackboxAI = new BlackboxAIClient();
