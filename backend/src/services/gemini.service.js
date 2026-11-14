import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, getGeminiModel } from '../config/env.js';

const SYSTEM_INSTRUCTION = `
Tu es l'assistant d'information générale de SANTÉ+.
Réponds en français, avec des mots simples, un ton respectueux et des réponses courtes.
Tu fournis uniquement des informations générales et éducatives.
Tu ne poses jamais de diagnostic et ne prescris aucun médicament ni dosage.
Tu ne prétends pas remplacer un professionnel de santé.
Si la personne décrit des signes graves ou une urgence possible, conseille-lui
de contacter immédiatement les services d'urgence ou de se rendre dans une
structure de santé, sans poser de nombreuses questions.
Si tu n'es pas sûr, dis-le clairement et recommande de consulter un professionnel.
`;

const FALLBACK_REPLY =
  "Je ne peux pas répondre à cette question. Pour votre sécurité, consultez un professionnel de santé.";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isOverloaded(error) {
  return (
    error.status === 503 ||
    error.status === 429 ||
    /UNAVAILABLE|high demand|RESOURCE_EXHAUSTED/i.test(error.message || '')
  );
}

export async function askGemini(message) {
  const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
  const models = [getGeminiModel(), process.env.GEMINI_FALLBACK_MODEL].filter(Boolean);

  let lastError;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: message,
          config: { systemInstruction: SYSTEM_INSTRUCTION }
        });
        return result.text?.trim() || FALLBACK_REPLY;
      } catch (error) {
        lastError = error;
        console.error(`Gemini (${model}, essai ${attempt}) :`, error.message);
        if (!isOverloaded(error)) break; // autre erreur : on passe au modèle suivant
        await sleep(1000 * attempt);     // surcharge : courte pause puis nouvel essai
      }
    }
  }

  throw lastError;
}