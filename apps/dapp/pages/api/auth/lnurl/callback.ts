import type { NextApiRequest, NextApiResponse } from 'next';
import { lnurlChallenges } from './challenge';

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

    // Vérifier que le challenge existe et n'est pas expiré
    const challenge = lnurlChallenges.get(k1);

    if (!challenge) {
      return res.status(400).json({ status: 'ERROR', reason: 'Challenge invalide ou expiré' });
    }

    if (Date.now() > challenge.expires) {
      lnurlChallenges.delete(k1);
      return res.status(400).json({ status: 'ERROR', reason: 'Challenge expiré' });
    }

    if (challenge.status === 'verified') {
      return res.status(400).json({ status: 'ERROR', reason: 'Challenge déjà utilisé' });
    }

    // Vérifier la signature secp256k1 : le wallet signe le k1 avec sa clé privée
    // sig est une signature DER hex, key est la clé publique compressée hex
    try {
      // @noble/secp256k1 v1 est CommonJS-compatible (contrairement à v2/noble/curves)
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

    // Marquer le challenge comme vérifié avec la clé publique du nœud
    lnurlChallenges.set(k1, {
      ...challenge,
      status: 'verified',
      pubkey: key,
    });

    // Réponse LNURL-Auth spec : { status: "OK" }
    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Erreur callback LNURL:', error);
    return res.status(500).json({ status: 'ERROR', reason: 'Erreur serveur' });
  }
}
