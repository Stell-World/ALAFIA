import { getPool } from '../config/database.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export async function getPregnancyRecord(req, res, next) {
  try {
    const result = await getPool().query(
      `SELECT discovery_date, last_consultation_date, follow_up_notes, created_at, updated_at
       FROM pregnancy_records WHERE user_id = $1`,
      [req.session.userId]
    );
    const row = result.rows[0];
    if (!row) return res.json({ pregnancy: null });
    return res.json({ pregnancy: {
      discoveryDate: row.discovery_date,
      lastConsultationDate: row.last_consultation_date,
      followUpNotes: row.follow_up_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } });
  } catch (error) {
    return next(error);
  }
}

export async function putPregnancyRecord(req, res, next) {
  const { discoveryDate, lastConsultationDate = null, followUpNotes = null } = req.body || {};
  if (!isValidDate(discoveryDate)) return res.status(400).json({ error: 'La date de découverte doit être au format AAAA-MM-JJ.' });
  if (lastConsultationDate !== null && !isValidDate(lastConsultationDate)) {
    return res.status(400).json({ error: 'La date de consultation doit être au format AAAA-MM-JJ.' });
  }
  if (followUpNotes !== null && (typeof followUpNotes !== 'string' || followUpNotes.trim().length > 1000)) {
    return res.status(400).json({ error: 'Les notes de suivi doivent contenir au plus 1000 caractères.' });
  }

  try {
    const result = await getPool().query(
      `INSERT INTO pregnancy_records (user_id, discovery_date, last_consultation_date, follow_up_notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         discovery_date = EXCLUDED.discovery_date,
         last_consultation_date = EXCLUDED.last_consultation_date,
         follow_up_notes = EXCLUDED.follow_up_notes,
         updated_at = NOW()
       RETURNING discovery_date, last_consultation_date, follow_up_notes, created_at, updated_at`,
      [req.session.userId, discoveryDate, lastConsultationDate, followUpNotes?.trim() || null]
    );
    const row = result.rows[0];
    return res.json({ pregnancy: {
      discoveryDate: row.discovery_date,
      lastConsultationDate: row.last_consultation_date,
      followUpNotes: row.follow_up_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } });
  } catch (error) {
    return next(error);
  }
}

export async function deletePregnancyRecord(req, res, next) {
  try {
    await getPool().query('DELETE FROM pregnancy_records WHERE user_id = $1', [req.session.userId]);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
