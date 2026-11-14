import { getPool } from '../config/database.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function validateMedication(body, { partial = false } = {}) {
  const values = {};
  if (!partial || Object.hasOwn(body, 'name')) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > 120) return { error: 'Le nom est obligatoire (120 caractères maximum).' };
    values.name = name;
  }
  if (!partial || Object.hasOwn(body, 'reminderTimes')) {
    const times = body.reminderTimes ?? [];
    if (!Array.isArray(times) || times.length > 12 || times.some((time) => typeof time !== 'string' || !TIME_RE.test(time))) {
      return { error: 'Les horaires doivent être une liste de valeurs au format HH:mm.' };
    }
    values.reminderTimes = [...new Set(times)];
  }
  if (!partial || Object.hasOwn(body, 'note')) {
    const note = body.note ?? null;
    if (note !== null && typeof note !== 'string') return { error: 'La note doit être du texte.' };
    if (typeof note === 'string' && note.trim().length > 500) return { error: 'La note ne peut pas dépasser 500 caractères.' };
    values.note = typeof note === 'string' && note.trim() ? note.trim() : null;
  }
  return { values };
}

function mapMedication(row) {
  return {
    id: row.id,
    name: row.name,
    reminderTimes: (row.reminder_times || []).map((time) => String(time).slice(0, 5)),
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listMedications(req, res, next) {
  try {
    const result = await getPool().query(
      `SELECT id, name, reminder_times, note, created_at, updated_at
       FROM patient_medications WHERE user_id = $1 ORDER BY created_at DESC, id DESC`,
      [req.session.userId]
    );
    return res.json({ medications: result.rows.map(mapMedication) });
  } catch (error) {
    return next(error);
  }
}

export async function createMedication(req, res, next) {
  const { values, error } = validateMedication(req.body || {});
  if (error) return res.status(400).json({ error });

  try {
    const result = await getPool().query(
      `INSERT INTO patient_medications (user_id, name, reminder_times, note)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, reminder_times, note, created_at, updated_at`,
      [req.session.userId, values.name, values.reminderTimes, values.note]
    );
    return res.status(201).json({ medication: mapMedication(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
}

export async function updateMedication(req, res, next) {
  if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Médicament introuvable.' });
  const { values, error } = validateMedication(req.body || {}, { partial: true });
  if (error) return res.status(400).json({ error });
  if (!Object.keys(values).length) return res.status(400).json({ error: 'Aucun champ à modifier.' });

  const columns = { name: 'name', reminderTimes: 'reminder_times', note: 'note' };
  const entries = Object.entries(values);
  const assignments = entries.map(([key], index) => `${columns[key]} = $${index + 3}`);
  assignments.push('updated_at = NOW()');

  try {
    const result = await getPool().query(
      `UPDATE patient_medications SET ${assignments.join(', ')}
       WHERE id = $1 AND user_id = $2
       RETURNING id, name, reminder_times, note, created_at, updated_at`,
      [req.params.id, req.session.userId, ...entries.map(([, value]) => value)]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Médicament introuvable.' });
    return res.json({ medication: mapMedication(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMedication(req, res, next) {
  if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Médicament introuvable.' });
  try {
    const result = await getPool().query(
      'DELETE FROM patient_medications WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.session.userId]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Médicament introuvable.' });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
