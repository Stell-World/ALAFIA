import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { getPool } from '../config/database.js';

export function createSessionMiddleware() {
  const PgStore = connectPgSimple(session);
  const sameSite = (process.env.SESSION_SAME_SITE || 'lax').toLowerCase();
  if (!['lax', 'strict', 'none'].includes(sameSite)) {
    throw new Error('SESSION_SAME_SITE doit être lax, strict ou none.');
  }

  return session({
    name: 'alafia.sid',
    store: new PgStore({ pool: getPool(), createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
      sameSite,
      maxAge: 8 * 60 * 60 * 1000
    }
  });
}
