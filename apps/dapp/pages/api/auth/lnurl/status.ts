import type { NextApiRequest, NextApiResponse } from 'next';
import { lnurlChallengesDb } from '../../../../lib/supabaseServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { k1 } = req.query;

  if (!k1 || typeof k1 !== 'string') {
    return res.status(400).json({ error: 'k1 manquant' });
  }

  try {
    const challenge = await lnurlChallengesDb.findByK1(k1);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge introuvable ou expiré' });
    }

    if (challenge.expires_at < new Date()) {
      await lnurlChallengesDb.delete(k1);
      return res.status(410).json({ error: 'Challenge expiré' });
    }

    if (challenge.status === 'verified' && challenge.pubkey) {
      // Consommer le challenge une fois récupéré par le frontend
      await lnurlChallengesDb.delete(k1);

      return res.status(200).json({
        status: 'verified',
        pubkey: challenge.pubkey,
        sub: `lnurl_${challenge.pubkey.substring(0, 16)}`,
        name: 'Lightning User',
        given_name: 'Lightning',
        family_name: 'User',
        email: '',
      });
    }

    return res.status(200).json({ status: 'pending' });
  } catch (error) {
    console.error('Erreur status LNURL:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
