import bcrypt from 'bcryptjs';
import { getPool } from '../config/database.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9().\s-]{8,24}$/;
const COOKIE_NAME = 'alafia.sid';

function cleanProfile(body) {
  const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : '';
  const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.replace(/[().\s-]/g, '') : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!firstName || firstName.length > 80 || !lastName || lastName.length > 80) {
    return { error: 'Les prénoms et nom sont obligatoires (80 caractères maximum).' };
  }
  if (!EMAIL_RE.test(email) || email.length > 254) return { error: 'Adresse e-mail invalide.' };
  if (!PHONE_RE.test(phone)) return { error: 'Numéro de téléphone invalide.' };
  if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    return { error: 'Le mot de passe doit contenir entre 12 et 72 caractères.' };
  }

  return { firstName, lastName, email, phone, password };
}

function publicUser(user) {
  return { id: user.id, role: user.role, firstName: user.first_name, lastName: user.last_name, email: user.email };
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
}

function saveSession(req) {
  return new Promise((resolve, reject) => req.session.save((error) => error ? reject(error) : resolve()));
}

async function startSession(req, user) {
  await regenerateSession(req);
  req.session.userId = user.id;
  req.session.role = user.role;
  await saveSession(req);
}

export async function register(req, res, next) {
  const profile = cleanProfile(req.body);
  if (profile.error) return res.status(400).json({ error: profile.error });

  try {
    const passwordHash = await bcrypt.hash(profile.password, 12);
    const result = await getPool().query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'PATIENT')
       RETURNING id, role, first_name, last_name, email`,
      [profile.firstName, profile.lastName, profile.email, profile.phone, passwordHash]
    );
    const user = result.rows[0];
    await startSession(req, user);
    return res.status(201).json({ userId: user.id, role: user.role });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Un compte existe déjà avec cet e-mail ou ce téléphone.' });
    }
    return next(error);
  }
}

export async function login(req, res, next) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!EMAIL_RE.test(email) || password.length < 1 || password.length > 72) {
    return res.status(400).json({ error: 'E-mail ou mot de passe invalide.' });
  }

  try {
    const result = await getPool().query(
      `SELECT id, role, first_name, last_name, email, password_hash, status
       FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    const user = result.rows[0];
    const matches = user && user.status === 'ACTIVE' && await bcrypt.compare(password, user.password_hash);
    if (!matches) return res.status(401).json({ error: 'E-mail ou mot de passe incorrect.' });

    await startSession(req, user);
    return res.json({ user: { id: user.id, role: user.role } });
  } catch (error) {
    return next(error);
  }
}

export function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return res.status(204).end();
  });
}

export async function me(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Connexion requise.' });

  try {
    const result = await getPool().query(
      `SELECT id, role, first_name, last_name, email FROM users
       WHERE id = $1 AND status = 'ACTIVE' LIMIT 1`,
      [req.session.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Connexion requise.' });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}
