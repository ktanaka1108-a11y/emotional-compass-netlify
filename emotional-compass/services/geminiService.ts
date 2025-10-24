import { GoogleGenAI, Type } from "@google/genai";
import type { AIResponse, ConversationTurn, UnsureSignal } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    secondary: { type: Type.ARRAY, items: { type: Type.STRING } },
    primary: { type: Type.ARRAY, items: { type: Type.STRING } },
    bridgeText_en: { type: Type.STRING },
    bridgeText_ja: { type: Type.STRING },
    grounding_en: { type: Type.STRING },
    grounding_ja: { type: Type.STRING },
    summary_en: { type: Type.STRING },
    summary_ja: { type: Type.STRING },
  },
  required: ['secondary', 'primary', 'bridgeText_en', 'bridgeText_ja', 'grounding_en', 'grounding_ja', 'summary_en', 'summary_ja']
};

const followUpQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    question_en: { type: Type.STRING },
    question_ja: { type: Type.STRING },
  },
  required: ['question_en', 'question_ja'],
};


const generateContentWithRetry = async (prompt: string, schema: object) => {
    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });
        const text = response.text.trim();
        const jsonString = text.replace(/^```json\n/, '').replace(/\n```$/, '');
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
};

export async function getFirstQuestionForUnsurePath(
  signals: string[],
  freeText: string,
  t: (key: any) => string
): Promise<{ question_en: string; question_ja: string; }> {
  const signalText = signals.map(s => t(s.replace(/-/g, '_'))).join(', ');

  const prompt = `
    You are a compassionate emotional coach. A user feels unsure about their emotions.
    They've provided these signals:
    - Sensations/Situations: "${signalText}"
    - Their own words: "${freeText}"

    Based on this, generate a single, gentle, open-ended follow-up question to help them clarify their feelings.
    For example: "It sounds like a lot is happening. When you say '${freeText}', what's the strongest physical sensation you notice in your body?"
    or "Thank you for sharing. These feelings of '${signalText}' can be heavy. What was happening right before you started to feel this way?"

    The goal is NOT to label the emotion yet, but to help them explore the context or physical sensations more deeply.
    Return a JSON object with "question_en" and "question_ja".
  `;

  try {
      return await generateContentWithRetry(prompt, followUpQuestionSchema);
  } catch (error) {
       return {
            question_en: "Thank you for sharing. What was happening right before you started to feel this way?",
            question_ja: "共有してくれてありがとう。そう感じ始める直前、何が起きていましたか？"
       };
  }
}

export async function getFollowUpQuestion(
  conversation: ConversationTurn[],
  language: 'en' | 'ja'
): Promise<{ question_en: string; question_ja: string; }> {
  const history = conversation.map(turn => `Coach: ${turn.question}\nUser: ${turn.answer}`).join('\n\n');
  const lastAnswer = conversation[conversation.length - 1]?.answer || "";

  const prompt = `
    You are a compassionate emotional coach. You are in a reflective conversation with a user.
    Here is the conversation so far:
    ${history}

    Based on the user's last answer ("${lastAnswer}"), ask ONE more gentle, curious, open-ended question to help them explore their feelings more deeply.
    Do not give advice or analysis. Just ask a question.
    Good examples: "What does that feeling of 'stuck' feel like in your body?", "When you say they didn't listen, what was the hardest part about that for you?", "And what did you do next?".
    Bad examples: "Why do you think you felt that way?", "Maybe you should try...", "It sounds like you have anxiety."

    Return a JSON object with "question_en" and "question_ja".
  `;
    try {
        return await generateContentWithRetry(prompt, followUpQuestionSchema);
    } catch (error) {
        return {
            question_en: "Thank you for sharing that. Could you tell me a little more?",
            question_ja: "教えてくれてありがとう。もう少し詳しく聞かせてもらえますか？"
        };
    }
}

export async function getAIMentorship(
  journalEntry: {
    secondaryEmotion: string | null;
    intensity: number;
    unsureSignals: string[];
    conversation: ConversationTurn[];
  },
  preferredName: string | null,
): Promise<AIResponse> {
  const conversationHistory = journalEntry.conversation.map(turn => `Coach: "${turn.question}"\nUser: "${turn.answer}"`).join('\n');
  const nameInstruction = preferredName ? `End the summary with their name, "${preferredName}".` : "Do not use a name in the summary.";
  const unsureSignalsText = (journalEntry.unsureSignals || []).join(', ');

  const prompt = `
    You are a trauma-informed emotional coach.
    A user has completed a reflection. Analyze their inputs below to provide a gentle, insightful mentorship summary.

    - Initial Emotion (if any): ${journalEntry.secondaryEmotion || "User was unsure"}
    - Intensity (1-10): ${journalEntry.intensity}
    - Sensations/Contexts Chosen: ${unsureSignalsText}
    - Reflective Conversation:
    ${conversationHistory}

    Your task is to return a JSON object with the following keys:
    1.  "secondary": An array of 1-3 likely SECONDARY EMOTIONS (e.g., irritation, frustration, overwhelm).
    2.  "primary": An array of 1-2 likely core PRIMARY EMOTIONS/NEEDS (e.g., sadness, fear, need for safety, need to be understood, need for autonomy).
    3.  "bridgeText_en" / "bridgeText_ja": A single, validating sentence that connects the secondary feeling to the primary need. E.g., "It makes perfect sense that you'd feel so irritated when it seems like your need to be heard wasn't being met."
    4.  "grounding_en" / "grounding_ja": A short, simple instruction for a grounding exercise. E.g., "Take a slow breath, and feel your feet on the floor."
    5.  "summary_en" / "summary_ja": A concise, one-paragraph summary. It should be warm and validating. Gently reframe the situation, highlighting the user's underlying need and strength. ${nameInstruction}

    Tone: Validating, non-judgmental, simple, and warm.
  `;

  try {
      return await generateContentWithRetry(prompt, responseSchema);
  } catch (error) {
    const fallbackText = "I'm having a little trouble connecting right now. Let's take a deep breath together. Please try again in a moment.";
    const fallbackTextJa = "現在、接続に問題が発生しています。一緒に深呼吸しましょう。しばらくしてからもう一度お試しください。";
    return {
      secondary: [],
      primary: [],
      bridgeText_en: fallbackText,
      bridgeText_ja: fallbackTextJa,
      grounding_en: 'Breathe.',
      grounding_ja: '呼吸して。',
      summary_en: fallbackText,
      summary_ja: fallbackTextJa,
    };
  }
}