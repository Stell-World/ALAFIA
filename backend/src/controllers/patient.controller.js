import { getPool } from '../config/database.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_WITH_TIMEZONE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i;

function validateMeasurement(body, { partial = false } = {}) {
  const values = {};

  if (!partial || Object.hasOwn(body, 'type')) {
    const type = typeof body.type === 'string' ? body.type.trim() : '';
    if (!type || type.length > 50) return { error: 'Le type de mesure est obligatoire (50 caractères maximum).' };
    values.type = type;
  }
  if (!partial || Object.hasOwn(body, 'value')) {
    if (typeof body.value !== 'number' || !Number.isFinite(body.value) || body.value < 0 || body.value > 1_000_000_000) {
      return { error: 'La valeur doit être un nombre positif valide.' };
    }
    values.value = body.value;
  }
  if (!partial || Object.hasOwn(body, 'unit')) {
    const unit = typeof body.unit === 'string' ? body.unit.trim() : '';
    if (!unit || unit.length > 24) return { error: 'L’unité est obligatoire (24 caractères maximum).' };
    values.unit = unit;
  }
  if (!partial || Object.hasOwn(body, 'measuredAt')) {
    const measuredAt = body.measuredAt;
    if (typeof measuredAt !== 'string' || !ISO_WITH_TIMEZONE_RE.test(measuredAt) || Number.isNaN(Date.parse(measuredAt))) {
      return { error: 'La date doit être une date ISO 8601 avec fuseau horaire.' };
    }
    values.measuredAt = new Date(measuredAt).toISOString();
  }
  if (Object.hasOwn(body, 'note')) {
    if (body.note !== null && typeof body.note !== 'string') return { error: 'La note doit être du texte.' };
    const note = typeof body.note === 'string' ? body.note.trim() : null;
    if (note && note.length > 500) return { error: 'La note ne peut pas dépasser 500 caractères.' };
    values.note = note || null;
  }

  return { values };
}

function mapMeasurement(row) {
  return {
    id: row.id,
    type: row.type,
    value: Number(row.value),
    unit: row.unit,
    measuredAt: row.measured_at,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listMeasurements(req, res, next) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));

  try {
    const result = await getPool().query(
      `SELECT id, type, value, unit, measured_at, note, created_at, updated_at
       FROM patient_measurements WHERE user_id = $1
       ORDER BY measured_at DESC, id DESC LIMIT $2 OFFSET $3`,
      [req.session.userId, limit, (page - 1) * limit]
    );
    return res.json({ measurements: result.rows.map(mapMeasurement), page, limit });
  } catch (error) {
    return next(error);
  }
}

export async function createMeasurement(req, res, next) {
  const { values, error } = validateMeasurement(req.body || {});
  if (error) return res.status(400).json({ error });

  try {
    const result = await getPool().query(
      `INSERT INTO patient_measurements (user_id, type, value, unit, measured_at, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, type, value, unit, measured_at, note, created_at, updated_at`,
      [req.session.userId, values.type, values.value, values.unit, values.measuredAt, values.note ?? null]
    );
    return res.status(201).json({ measurement: mapMeasurement(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
}

export async function updateMeasurement(req, res, next) {
  if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Mesure introuvable.' });
  const body = req.body || {};
  const { values, error } = validateMeasurement(body, { partial: true });
  if (error) return res.status(400).json({ error });
  if (!Object.keys(values).length) return res.status(400).json({ error: 'Aucun champ à modifier.' });

  const columns = { type: 'type', value: 'value', unit: 'unit', measuredAt: 'measured_at', note: 'note' };
  const entries = Object.entries(values);
  const assignments = entries.map(([key], index) => `${columns[key]} = $${index + 3}`);
  assignments.push('updated_at = NOW()');

  try {
    const result = await getPool().query(
      `UPDATE patient_measurements SET ${assignments.join(', ')}
       WHERE id = $1 AND user_id = $2
       RETURNING id, type, value, unit, measured_at, note, created_at, updated_at`,
      [req.params.id, req.session.userId, ...entries.map(([, value]) => value)]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Mesure introuvable.' });
    return res.json({ measurement: mapMeasurement(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMeasurement(req, res, next) {
  if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Mesure introuvable.' });

  try {
    const result = await getPool().query(
      'DELETE FROM patient_measurements WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.session.userId]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Mesure introuvable.' });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
