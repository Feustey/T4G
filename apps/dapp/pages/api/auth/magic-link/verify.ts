import type { NextApiRequest, NextApiResponse } from 'next';
import { magicLinkTokens } from './send';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token manquant' });
  }

  const tokenData = magicLinkTokens.get(token);

  if (!tokenData) {
    return res.status(401).json({ error: 'Token invalide ou déjà utilisé' });
  }

  if (Date.now() > tokenData.expires) {
    magicLinkTokens.delete(token);
    return res.status(401).json({ error: 'Token expiré, veuillez demander un nouveau lien' });
  }

  // Consommer le token (usage unique)
  magicLinkTokens.delete(token);

  const email = tokenData.email;
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
