import { getPool } from '../config/database.js';
import { askGemini } from '../services/gemini.service.js';

const URGENCE = /(douleur.*poitrine|ne respire plus|difficult[ée] .{0,10}respirer|saign.*beaucoup|perte de connaissance|convulsion|empoisonn|suicid)/i;
const URGENCE_REPLY =
  "Ces signes peuvent être graves. Contactez immédiatement les services d'urgence ou rendez-vous dans la structure de santé la plus proche. Ne restez pas seul(e).";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeMessages(body) {
  if (typeof body?.message === 'string') {
    const content = body.message.trim();
    return content && content.length <= 2000 ? [{ role: 'user', content }] : null;
  }

  if (!Array.isArray(body?.messages) || body.messages.length < 1 || body.messages.length > 20) {
    return null;
  }

  const valid = body.messages.every((item) =>
    item && ['user', 'assistant'].includes(item.role)
    && typeof item.content === 'string'
    && item.content.trim().length > 0
    && item.content.length <= 2000
  );
  if (!valid) return null;

  return body.messages.map(({ role, content }) => ({ role, content: content.trim() }));
}

async function saveExchange({ userId, conversationId, userMessage, assistantMessage }) {
  const pool = getPool();
  const client = await pool.connect();
  let resolvedId = conversationId;

  try {
    await client.query('BEGIN');

    if (!resolvedId) {
      const created = await client.query(
        `INSERT INTO conversations (user_id, title)
         VALUES ($1, 'Nouvelle conversation') RETURNING id`,
        [userId]
      );
      resolvedId = created.rows[0].id;
    } else {
      const owned = await client.query(
        'SELECT id FROM conversations WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [resolvedId, userId]
      );
      if (!owned.rowCount) {
        await client.query('ROLLBACK');
        return null;
      }
    }

    await client.query(
      `INSERT INTO conversation_messages (conversation_id, role, content)
       VALUES ($1, 'user', $2), ($1, 'assistant', $3)`,
      [resolvedId, userMessage, assistantMessage]
    );
    await client.query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
      [resolvedId]
    );
    await client.query('COMMIT');
    return resolvedId;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function postChatMessage(req, res, next) {
  try {
    const messages = normalizeMessages(req.body);
    const conversationId = req.body?.conversationId;
    const saveConversation = req.body?.saveConversation === true;

    if (!messages || messages.at(-1).role !== 'user') {
      return res.status(400).json({ error: 'Envoyez entre 1 et 20 messages valides et terminez par un message utilisateur.' });
    }
    if (conversationId !== undefined && (typeof conversationId !== 'string' || !UUID_RE.test(conversationId))) {
      return res.status(400).json({ error: 'Identifiant de conversation invalide.' });
    }
    if (typeof req.body?.saveConversation !== 'undefined' && typeof req.body.saveConversation !== 'boolean') {
      return res.status(400).json({ error: 'saveConversation doit être un booléen.' });
    }

    const shouldSave = saveConversation || Boolean(conversationId);
    const userId = req.session?.userId;
    if (shouldSave && !userId) {
      return res.status(401).json({ error: 'Connectez-vous pour enregistrer une conversation.' });
    }

    const preferredLanguage = req.body?.preferredLanguage ?? 'fr';
    if (!['fr', 'fr-FR'].includes(preferredLanguage)) {
      return res.status(200).json({ reply: 'Je peux répondre en français pour le moment. Envoyez votre question en français.' });
    }

    const latestMessage = messages.at(-1).content;
    const reply = URGENCE.test(latestMessage) ? URGENCE_REPLY : await askGemini(messages);

    if (!shouldSave) return res.json({ reply });

    const savedConversationId = await saveExchange({
      userId,
      conversationId,
      userMessage: latestMessage,
      assistantMessage: reply
    });
    if (!savedConversationId) return res.status(404).json({ error: 'Conversation introuvable.' });

    return res.json({ reply, conversationId: savedConversationId });
  } catch (error) {
    next(error);
  }
}
