import { askGemini } from '../services/gemini.service.js';

const URGENCE = /(douleur.*poitrine|ne respire plus|difficult[ée] .{0,10}respirer|saign.*beaucoup|perte de connaissance|convulsion|empoisonn|suicid)/i;

const URGENCE_REPLY =
  "⚠️ Ces signes peuvent être graves. Contactez immédiatement les services d'urgence ou rendez-vous dans la structure de santé la plus proche. Ne restez pas seul(e).";

export async function postAssistantMessage(req, res, next) {
  try {
    const message = req.body?.message;

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Le message est obligatoire.' });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: 'Le message est trop long (maximum 2000 caractères).'
      });
    }

    const cleaned = message.trim();

    if (URGENCE.test(cleaned)) {
      return res.status(200).json({ reply: URGENCE_REPLY });
    }

    const reply = await askGemini(cleaned);
    return res.status(200).json({ reply });
  } catch (error) {
    next(error);
  }
}