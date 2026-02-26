import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyMagicToken } from './send';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token } = req.body ?? {};

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token manquant' });
    }

    const email = verifyMagicToken(token);

    if (!email) {
      return res.status(401).json({ error: 'Token invalide ou expiré, veuillez demander un nouveau lien' });
    }

    const name = email.split('@')[0];

    return res.status(200).json({
      email,
      name,
      given_name: name,
      family_name: '',
      sub: `magic_${Buffer.from(email).toString('base64url')}`,
      picture: '',
    });
  } catch (error) {
    console.error('[magic-link/verify] Erreur inattendue:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors de la vérification. Veuillez réessayer ou demander un nouveau lien.',
    });
  }
}
