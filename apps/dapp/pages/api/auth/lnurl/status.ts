import type { NextApiRequest, NextApiResponse } from 'next';
import { lnurlChallenges } from './challenge';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { k1 } = req.query;

  if (!k1 || typeof k1 !== 'string') {
    return res.status(400).json({ error: 'k1 manquant' });
  }

  const challenge = lnurlChallenges.get(k1);

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge introuvable ou expiré' });
  }

  if (Date.now() > challenge.expires) {
    lnurlChallenges.delete(k1);
    return res.status(410).json({ error: 'Challenge expiré' });
  }

  if (challenge.status === 'verified' && challenge.pubkey) {
    // Consommer le challenge une fois récupéré par le frontend
    lnurlChallenges.delete(k1);

    return res.status(200).json({
      status: 'verified',
      pubkey: challenge.pubkey,
      // Données utilisateur dérivées de la clé publique Lightning
      sub: `lnurl_${challenge.pubkey.substring(0, 16)}`,
      name: `Lightning User`,
      given_name: 'Lightning',
      family_name: 'User',
      email: '',
    });
  }

  return res.status(200).json({ status: 'pending' });
}
