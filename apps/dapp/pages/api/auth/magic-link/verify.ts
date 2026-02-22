import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyMagicToken } from './send';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

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
}
