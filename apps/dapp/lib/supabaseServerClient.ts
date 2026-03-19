import { Pool } from 'pg';

/**
 * Pool de connexions PostgreSQL vers la base Railway.
 * Utilise la variable DATABASE_URL (Railway production).
 * Réservé aux API Routes Next.js (server-side uniquement).
 */
let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('Variable DATABASE_URL manquante.');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }
  return pool;
}

// ── Types pour la table lnurl_challenges ────────────────────────────────────

export interface LnurlChallenge {
  k1: string;
  status: 'pending' | 'verified';
  pubkey: string | null;
  expires_at: Date;
  created_at: Date;
}

export const lnurlChallengesDb = {
  async insert(k1: string, expiresAt: Date): Promise<void> {
    const db = getDbPool();
    await db.query(
      'INSERT INTO lnurl_challenges (k1, status, expires_at) VALUES ($1, $2, $3)',
      [k1, 'pending', expiresAt]
    );
  },

  async findByK1(k1: string): Promise<LnurlChallenge | null> {
    const db = getDbPool();
    const { rows } = await db.query<LnurlChallenge>(
      'SELECT * FROM lnurl_challenges WHERE k1 = $1',
      [k1]
    );
    return rows[0] ?? null;
  },

  async markVerified(k1: string, pubkey: string): Promise<void> {
    const db = getDbPool();
    await db.query(
      "UPDATE lnurl_challenges SET status = 'verified', pubkey = $2 WHERE k1 = $1",
      [k1, pubkey]
    );
  },

  async delete(k1: string): Promise<void> {
    const db = getDbPool();
    await db.query('DELETE FROM lnurl_challenges WHERE k1 = $1', [k1]);
  },
};
