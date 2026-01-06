import { create } from "zustand";

import {
    blackboxAI,
    type AnalysisContext,
    type AnalysisResult,
    type Message,
    type ReplySuggestion,
} from "@/src/core/api/blackbox";
import { supabase } from "@/src/core/api/supabase";

export type AnalysisStep =
  | "idle"
  | "uploading"
  | "processing"
  | "analyzing"
  | "complete"
  | "error";

interface AnalysisState {
  // Current analysis session
  currentStep: AnalysisStep;
  screenshotUri: string | null;
  croppedUri: string | null;
  blurredUri: string | null;

  // Context from user
  context: AnalysisContext;

  // Results
  analysisResult: AnalysisResult | null;
  selectedReply: ReplySuggestion | null;
  refinedReply: string | null;

  // Chat History
  messages: Message[];
  isChatLoading: boolean;

  // Outcome tracking
  outcome: "sent" | "saved" | "discarded" | null;
  outcomeResult: "positive" | "neutral" | "negative" | null;

  // Error handling
  error: string | null;

  // Progress
  progress: number;
  progressMessage: string;

  // Actions
  setScreenshot: (uri: string) => void;
  setCroppedImage: (uri: string) => void;
  setBlurredImage: (uri: string) => void;
  setContext: (context: Partial<AnalysisContext>) => void;

  startAnalysis: (imageBase64: string) => Promise<void>;
  selectReply: (reply: ReplySuggestion) => void;
  refineReply: (feedback: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;

  setOutcome: (outcome: "sent" | "saved" | "discarded") => void;
  setOutcomeResult: (result: "positive" | "neutral" | "negative") => void;

  saveAnalysis: (userId: string) => Promise<string | null>;
  resetAnalysis: () => void;
}

const initialContext: AnalysisContext = {
  goal: "dating",
  style: "playful",
  additionalContext: "",
  userQuestion: "",
};

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  // Initial state
  currentStep: "idle",
  screenshotUri: null,
  croppedUri: null,
  blurredUri: null,
  context: initialContext,
  analysisResult: null,
  selectedReply: null,
  refinedReply: null,
  messages: [],
  isChatLoading: false,
  outcome: null,
  outcomeResult: null,
  error: null,
  progress: 0,
  progressMessage: "",

  // Set screenshot URI
  setScreenshot: (uri) => {
    set({ screenshotUri: uri, currentStep: "idle", error: null });
  },

  // Set cropped image
  setCroppedImage: (uri) => {
    set({ croppedUri: uri });
  },

  // Set blurred image
  setBlurredImage: (uri) => {
    set({ blurredUri: uri });
  },

  // Update context
  setContext: (contextUpdate) => {
    set((state) => ({
      context: { ...state.context, ...contextUpdate },
    }));
  },

  // Start AI analysis
  startAnalysis: async (imageBase64) => {
    const { context } = get();

    try {
      set({
        currentStep: "processing",
        progress: 0,
        progressMessage: "Lecture de la conversation...",
        error: null,
        messages: [], // Reset messages
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        set((state) => {
          if (state.progress < 80) {
            const newProgress = state.progress + 10;
            let message = "Lecture de la conversation...";
            if (newProgress >= 30) message = "Compréhension du contexte...";
            if (newProgress >= 60) message = "Génération des suggestions...";
            return { progress: newProgress, progressMessage: message };
          }
          return state;
        });
      }, 500);

      set({ currentStep: "analyzing" });

      // Call Blackbox AI logic manually to capture messages
      // We are recreating analyzeConversation logic here to store messages
      // Ideally BlackboxAIClient should return the messages too, but for now we reconstruct
      const systemPrompt = blackboxAI.buildSystemPrompt(context);
      const userMessageContent = blackboxAI.buildUserMessage(imageBase64, context);

      const initialMessages: Message[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessageContent },
      ];

      const response = await blackboxAI.chat(initialMessages);
      const responseContent = response.choices[0].message.content;
      const result = blackboxAI.parseAnalysisResponse(responseContent);

      clearInterval(progressInterval);

      set({
        currentStep: "complete",
        analysisResult: result,
        messages: [
          ...initialMessages,
          { role: "assistant", content: responseContent }
        ],
        progress: 100,
        progressMessage: "Analyse terminée !",
      });
    } catch (error) {
      set({
        currentStep: "error",
        error: error instanceof Error ? error.message : "Analyse échouée",
        progress: 0,
        progressMessage: "",
      });
    }
  },

  // Select a reply suggestion
  selectReply: (reply) => {
    set({ selectedReply: reply, refinedReply: null });
  },

  // Refine the selected reply (Legacy wrapper, now uses sendMessage internally if needed, or stays separate)
  // For the new chat flow, we might just use sendMessage.
  // But to keep existing functionality working until full migration:
  refineReply: async (feedback) => {
      await get().sendMessage(feedback);
  },

  // Send a message in the chat (for refinement)
  sendMessage: async (content: string) => {
      const { messages, selectedReply, context } = get();

      // If this is the first user message in the chat, we need to provide context
      const isFirstUserMessage = messages.filter(m => m.role === "user").length === 0;

      let systemMessage: Message | null = null;
      if (isFirstUserMessage && selectedReply) {
        // Create a conversational system prompt for refinement (NO JSON OUTPUT)
        systemMessage = {
          role: "system",
          content: `Tu es Wingman, un coach de conversation. L'utilisateur a sélectionné cette réponse:
"${selectedReply.text}"

Il veut l'améliorer. Aide-le en proposant des variantes ou modifications selon ses demandes.
IMPORTANT: Réponds directement avec la réponse améliorée, sans explication ni JSON. Juste le texte de la nouvelle réponse.
Style préféré: ${context.style}. Objectif: ${context.goal}.`
        };
      }

      const newMessages: Message[] = systemMessage
        ? [systemMessage, ...messages.filter(m => m.role !== "system"), { role: "user", content }]
        : [...messages, { role: "user", content }];

      set({ messages: newMessages, isChatLoading: true, error: null });

      try {
          const response = await blackboxAI.chat(newMessages);
          let responseContent = response.choices[0].message.content;

          // Clean up the response: remove quotes if wrapped, trim whitespace
          responseContent = responseContent.trim();
          if (responseContent.startsWith('"') && responseContent.endsWith('"')) {
            responseContent = responseContent.slice(1, -1);
          }

          // Try to extract just the reply text if we detect JSON
          if (responseContent.includes('{') && responseContent.includes('"text"')) {
            try {
              const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.text) responseContent = parsed.text;
                else if (parsed.suggestions?.[0]?.text) responseContent = parsed.suggestions[0].text;
              }
            } catch {
              // Keep the original if parsing fails
            }
          }

          set((state) => ({
              messages: [...state.messages, { role: "assistant", content: responseContent }],
              refinedReply: responseContent, // Update the refined reply with the latest
              isChatLoading: false
          }));
      } catch (error) {
           set({
               error: error instanceof Error ? error.message : "Erreur d'envoi",
               isChatLoading: false
           });
      }
  },

  // Set outcome
  setOutcome: (outcome) => {
    set({ outcome });
  },

  // Set outcome result
  setOutcomeResult: (result) => {
    set({ outcomeResult: result });
  },

  // Save analysis to database
  saveAnalysis: async (userId) => {
    const state = get();

    try {
      const { data, error } = await supabase
        .from("analyses")
        .insert({
          user_id: userId,
          screenshot_url: state.screenshotUri ?? "",
          blurred_url: state.blurredUri,
          context: state.context as unknown as Record<string, unknown>,
          ai_analysis: state.analysisResult as unknown as Record<string, unknown>,
          suggested_replies: state.analysisResult?.suggestions as unknown as Record<string, unknown>[],
          chosen_reply: state.refinedReply ?? state.selectedReply?.text,
          outcome: state.outcome,
          outcome_result: state.outcomeResult,
        } as any as never)
        .select("id")
        .single();

      if (error) throw error;

      return (data as any)?.id ?? null;
    } catch (error) {
      console.error("Failed to save analysis:", error);
      return null;
    }
  },

  // Reset analysis state
  resetAnalysis: () => {
    set({
      currentStep: "idle",
      screenshotUri: null,
      croppedUri: null,
      blurredUri: null,
      context: initialContext,
      analysisResult: null,
      selectedReply: null,
      refinedReply: null,
      messages: [],
      isChatLoading: false,
      outcome: null,
      outcomeResult: null,
      error: null,
      progress: 0,
      progressMessage: "",
    });
  },
}));

// Selectors
export const useCurrentStep = () => useAnalysisStore((s) => s.currentStep);
export const useAnalysisResult = () => useAnalysisStore((s) => s.analysisResult);
export const useSelectedReply = () => useAnalysisStore((s) => s.selectedReply);
export const useChatMessages = () => useAnalysisStore((s) => s.messages);
export const useIsChatLoading = () => useAnalysisStore((s) => s.isChatLoading);
