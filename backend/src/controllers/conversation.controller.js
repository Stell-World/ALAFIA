import { getPool } from '../config/database.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function listConversations(req, res, next) {
  try {
    const result = await getPool().query(
      `SELECT id, title, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM conversations WHERE user_id = $1
       ORDER BY updated_at DESC, id DESC LIMIT 50`,
      [req.session.userId]
    );
    return res.json({ conversations: result.rows });
  } catch (error) {
    return next(error);
  }
}

export async function createConversation(req, res, next) {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : 'Nouvelle conversation';
  if (!title || title.length > 120) {
    return res.status(400).json({ error: 'Le titre doit contenir entre 1 et 120 caractères.' });
  }

  try {
    const result = await getPool().query(
      `INSERT INTO conversations (user_id, title) VALUES ($1, $2)
       RETURNING id, title, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [req.session.userId, title]
    );
    return res.status(201).json({ conversation: result.rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function getConversation(req, res, next) {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(404).json({ error: 'Conversation introuvable.' });

  try {
    const result = await getPool().query(
      `SELECT c.id, c.title, c.created_at AS "createdAt", c.updated_at AS "updatedAt",
              COALESCE(json_agg(json_build_object(
                'id', m.id, 'role', m.role, 'content', m.content, 'createdAt', m.created_at
              ) ORDER BY m.id) FILTER (WHERE m.id IS NOT NULL), '[]'::json) AS messages
       FROM conversations c
       LEFT JOIN conversation_messages m ON m.conversation_id = c.id
       WHERE c.id = $1 AND c.user_id = $2
       GROUP BY c.id`,
      [id, req.session.userId]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Conversation introuvable.' });
    return res.json({ conversation: result.rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function deleteConversation(req, res, next) {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(404).json({ error: 'Conversation introuvable.' });

  try {
    const result = await getPool().query(
      'DELETE FROM conversations WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.session.userId]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Conversation introuvable.' });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
