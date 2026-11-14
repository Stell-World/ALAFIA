export function errorHandler(error, req, res, next) {
  console.error('Erreur serveur :', error.message);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Requête JSON invalide.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Message trop volumineux.' });
  }
  if (error.status === 429 || error.status === 503) {
    return res.status(503).json({
      error: "Le service d'IA est très sollicité. Réessayez dans quelques secondes."
    });
  }

  return res.status(500).json({
    error: 'Le service est momentanément indisponible. Réessayez plus tard.'
  });
}