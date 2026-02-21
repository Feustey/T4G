import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { bech32 } from 'bech32';

// Stockage en mémoire des challenges LNURL-Auth
// Production : utiliser PostgreSQL ou Redis avec TTL
export const lnurlChallenges = new Map<string, {
  status: 'pending' | 'verified';
  pubkey?: string;
  expires: number;
}>();

// Nettoyage des challenges expirés
setInterval(() => {
  const now = Date.now();
  for (const [k1, data] of lnurlChallenges.entries()) {
    if (data.expires < now) {
      lnurlChallenges.delete(k1);
    }
  }
}, 30_000);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Générer un challenge aléatoire k1 (32 octets)
    const k1 = crypto.randomBytes(32).toString('hex');
    const expiresIn = 5 * 60 * 1000; // 5 minutes

    lnurlChallenges.set(k1, {
      status: 'pending',
      expires: Date.now() + expiresIn,
    });

    // Construire l'URL de callback qui recevra la signature du wallet
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:4200';
    const callbackUrl = `${appUrl}/api/auth/lnurl/callback?tag=login&k1=${k1}`;

    // Encoder en LNURL (bech32 avec préfixe "lnurl")
    const encoded = Buffer.from(callbackUrl, 'utf8');
    const words = bech32.toWords(encoded);
    const lnurl = bech32.encode('lnurl', words, 2000).toUpperCase();

    return res.status(200).json({
      lnurl,
      k1,
      callback_url: callbackUrl,
      expires_at: new Date(Date.now() + expiresIn).toISOString(),
    });
  } catch (error) {
    console.error('Erreur génération challenge LNURL:', error);
    return res.status(500).json({ error: 'Erreur génération challenge' });
  }
}
