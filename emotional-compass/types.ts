import type { ReactNode } from 'react';
import type { TranslationKey } from './localization';

export interface Emotion {
  nameKey: TranslationKey;
  icon: ReactNode;
  color: string;
  gradient: string;
}

export interface UnsureSignal {
  key: string;
  nameKey: TranslationKey;
}

export interface AIResponse {
  secondary: string[];
  primary: string[];
  bridgeText_en: string;
  bridgeText_ja: string;
  grounding_en: string;
  grounding_ja: string;
  summary_en: string;
  summary_ja: string;
}

export interface ConversationTurn {
  question: string;
  answer: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  secondaryEmotion: string | null;
  intensity: number;
  unsureSignals: string[];
  conversation: ConversationTurn[]; // Replaces freeText
  aiResponse: AIResponse;
}

export type AppState =
  | 'ONBOARDING_LANG'
  | 'ONBOARDING_NAME'
  | 'SELECTING_EMOTION'
  | 'SELECTING_UNSURE_SIGNALS'
  | 'ADJUSTING_INTENSITY'
  | 'REFLECTING' // Replaces REFLECTING_CONTEXT for a multi-step process
  | 'ANALYZING'
  | 'REFRAMING'
  | 'GROUNDING'
  | 'JOURNALING';