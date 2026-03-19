import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { bech32 } from 'bech32';
import { lnurlChallengesDb } from '../../../../lib/supabaseServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const k1 = crypto.randomBytes(32).toString('hex');
    const expiresIn = 5 * 60 * 1000; // 5 minutes
    const expiresAt = new Date(Date.now() + expiresIn);

    await lnurlChallengesDb.insert(k1, expiresAt);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:4200';
    const callbackUrl = `${appUrl}/api/auth/lnurl/callback?tag=login&k1=${k1}`;

    const encoded = Buffer.from(callbackUrl, 'utf8');
    const words = bech32.toWords(encoded);
    const lnurl = bech32.encode('lnurl', words, 2000).toUpperCase();

    return res.status(200).json({
      lnurl,
      k1,
      callback_url: callbackUrl,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Erreur génération challenge LNURL:', error);
    return res.status(500).json({ error: 'Erreur génération challenge' });
  }
}
