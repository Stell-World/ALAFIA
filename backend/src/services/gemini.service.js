import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, getGeminiModel } from '../config/env.js';

const SYSTEM_INSTRUCTION = `
Tu es l'assistant d'information générale de SANTÉ+.
Réponds en français, avec des mots simples, un ton respectueux et des réponses courtes (8 phrases maximum).
Écris en texte simple, sans Markdown : pas d'astérisques, pas de titres. Utilise des tirets pour les listes.
Tu fournis uniquement des informations générales et éducatives.
Tu ne poses jamais de diagnostic.
Tu ne cites aucun nom de médicament et ne donnes aucune dose, même à titre d'exemple.
Tu ne prétends pas remplacer un professionnel de santé.
Si la personne décrit des signes graves ou une urgence possible, conseille-lui
de contacter immédiatement les services d'urgence ou de se rendre dans une
structure de santé, sans poser de nombreuses questions.
Si tu n'es pas sûr, dis-le clairement et recommande de consulter un professionnel.
`;

const FALLBACK_REPLY =
  "Je ne peux pas répondre à cette question. Pour votre sécurité, consultez un professionnel de santé.";

const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 15000;

export async function askGemini(message) {
  const ai = new GoogleGenAI({
    apiKey: getGeminiApiKey(),
    httpOptions: { timeout: TIMEOUT_MS }
  });

  const models = [getGeminiModel(), process.env.GEMINI_FALLBACK_MODEL].filter(Boolean);

  const config = {
    systemInstruction: SYSTEM_INSTRUCTION,
    maxOutputTokens: 1000
  };

  let lastError;

  for (const model of models) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: message,
        config
      });
      return result.text?.trim() || FALLBACK_REPLY;
    } catch (error) {
      lastError = error;
      console.error(`Gemini (${model}) :`, error.message);
    }
  }

  throw lastError;
}