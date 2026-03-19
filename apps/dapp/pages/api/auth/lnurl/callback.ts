import type { NextApiRequest, NextApiResponse } from 'next';
import { lnurlChallengesDb } from '../../../../lib/supabaseServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // LNURL-Auth spec : le wallet envoie une requête GET
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'ERROR', reason: 'Method not allowed' });
  }

  try {
    const { k1, sig, key } = req.query;

    if (!k1 || !sig || !key || typeof k1 !== 'string' || typeof sig !== 'string' || typeof key !== 'string') {
      return res.status(400).json({ status: 'ERROR', reason: 'Paramètres manquants (k1, sig, key)' });
    }

    const challenge = await lnurlChallengesDb.findByK1(k1);

    if (!challenge) {
      return res.status(400).json({ status: 'ERROR', reason: 'Challenge invalide ou expiré' });
    }

    if (challenge.expires_at < new Date()) {
      await lnurlChallengesDb.delete(k1);
      return res.status(400).json({ status: 'ERROR', reason: 'Challenge expiré' });
    }

    if (challenge.status === 'verified') {
      return res.status(400).json({ status: 'ERROR', reason: 'Challenge déjà utilisé' });
    }

    // Vérifier la signature secp256k1 : le wallet signe le k1 avec sa clé privée
    try {
      const secp = await import('@noble/secp256k1');
      const k1Bytes = Buffer.from(k1, 'hex');
      const sigBytes = Buffer.from(sig, 'hex');
      const pubkeyBytes = Buffer.from(key, 'hex');

      const isValid = secp.verify(sigBytes, k1Bytes, pubkeyBytes);

      if (!isValid) {
        return res.status(401).json({ status: 'ERROR', reason: 'Signature invalide' });
      }
    } catch {
      return res.status(401).json({ status: 'ERROR', reason: 'Signature malformée' });
    }

    await lnurlChallengesDb.markVerified(k1, key);

    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Erreur callback LNURL:', error);
    return res.status(500).json({ status: 'ERROR', reason: 'Erreur serveur' });
  }
}
