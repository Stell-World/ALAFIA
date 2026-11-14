export function requireSessionConfig(req, res, next) {
  if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    return res.status(503).json({
      error: 'Authentification indisponible : configurez DATABASE_URL et une SESSION_SECRET d’au moins 32 caractères.'
    });
  }

  if (!req.session) {
    return res.status(503).json({ error: 'La session serveur n’est pas initialisée.' });
  }

  next();
}
