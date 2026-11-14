import { getPool } from '../config/database.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_WITH_TIMEZONE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i;
const ALLOWED_CHANNELS = new Set(['platform', 'sms', 'whatsapp']);

function isValidTimezone(value) {
  if (typeof value !== 'string' || value.length > 64) return false;
  try {
    new Intl.DateTimeFormat('fr-FR', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function validateAppointment(body, { partial = false } = {}) {
  const values = {};
  if (!partial || Object.hasOwn(body, 'startsAt')) {
    if (typeof body.startsAt !== 'string' || !ISO_WITH_TIMEZONE_RE.test(body.startsAt) || Number.isNaN(Date.parse(body.startsAt))) {
      return { error: 'La date doit être au format ISO 8601 avec fuseau horaire.' };
    }
    values.startsAt = new Date(body.startsAt).toISOString();
  }
  if (!partial || Object.hasOwn(body, 'timezone')) {
    if (!isValidTimezone(body.timezone)) return { error: 'Le fuseau horaire doit être un fuseau IANA valide.' };
    values.timezone = body.timezone;
  }
  if (!partial || Object.hasOwn(body, 'reason')) {
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    if (!reason || reason.length > 300) return { error: 'Le motif est obligatoire (300 caractères maximum).' };
    values.reason = reason;
  }
  if (!partial || Object.hasOwn(body, 'location')) {
    const location = body.location ?? null;
    if (location !== null && typeof location !== 'string') return { error: 'Le lieu doit être du texte.' };
    if (typeof location === 'string' && location.trim().length > 180) return { error: 'Le lieu ne peut pas dépasser 180 caractères.' };
    values.location = typeof location === 'string' && location.trim() ? location.trim() : null;
  }
  if (!partial || Object.hasOwn(body, 'reminderChannels')) {
    const channels = body.reminderChannels ?? [];
    if (!Array.isArray(channels) || channels.length > ALLOWED_CHANNELS.size || channels.some((channel) => !ALLOWED_CHANNELS.has(channel))) {
      return { error: 'Les canaux doivent être platform, sms ou whatsapp.' };
    }
    values.reminderChannels = [...new Set(channels)];
  }
  return { values };
}

function mapAppointment(row) {
  return {
    id: row.id,
    startsAt: row.starts_at,
    timezone: row.timezone,
    location: row.location,
    reason: row.reason,
    reminderChannels: row.reminder_channels || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listAppointments(req, res, next) {
  try {
    const result = await getPool().query(
      `SELECT id, starts_at, timezone, location, reason, reminder_channels, created_at, updated_at
       FROM patient_appointments WHERE user_id = $1
       ORDER BY starts_at ASC, id ASC LIMIT 100`,
      [req.session.userId]
    );
    return res.json({ appointments: result.rows.map(mapAppointment) });
  } catch (error) {
    return next(error);
  }
}

export async function createAppointment(req, res, next) {
  const { values, error } = validateAppointment(req.body || {});
  if (error) return res.status(400).json({ error });

  try {
    const result = await getPool().query(
      `INSERT INTO patient_appointments (user_id, starts_at, timezone, location, reason, reminder_channels)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, starts_at, timezone, location, reason, reminder_channels, created_at, updated_at`,
      [req.session.userId, values.startsAt, values.timezone, values.location, values.reason, values.reminderChannels]
    );
    return res.status(201).json({ appointment: mapAppointment(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
}

export async function updateAppointment(req, res, next) {
  if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  const { values, error } = validateAppointment(req.body || {}, { partial: true });
  if (error) return res.status(400).json({ error });
  if (!Object.keys(values).length) return res.status(400).json({ error: 'Aucun champ à modifier.' });

  const columns = { startsAt: 'starts_at', timezone: 'timezone', location: 'location', reason: 'reason', reminderChannels: 'reminder_channels' };
  const entries = Object.entries(values);
  const assignments = entries.map(([key], index) => `${columns[key]} = $${index + 3}`);
  assignments.push('updated_at = NOW()');

  try {
    const result = await getPool().query(
      `UPDATE patient_appointments SET ${assignments.join(', ')}
       WHERE id = $1 AND user_id = $2
       RETURNING id, starts_at, timezone, location, reason, reminder_channels, created_at, updated_at`,
      [req.params.id, req.session.userId, ...entries.map(([, value]) => value)]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
    return res.json({ appointment: mapAppointment(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAppointment(req, res, next) {
  if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  try {
    const result = await getPool().query(
      'DELETE FROM patient_appointments WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.session.userId]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
