import pg from 'pg';

let pool;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('La base de données n’est pas configurée.');
    error.code = 'DATABASE_NOT_CONFIGURED';
    throw error;
  }

  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
    pool.on('error', () => console.error('Erreur inattendue du pool PostgreSQL.'));
  }

  return pool;
}
