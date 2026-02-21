import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Proxy serveur pour la vérification de session Dazno.
 * Contourne le CORS : l'appel à api.dazno.de se fait depuis le serveur Next.js,
 * pas depuis le navigateur, donc l'origine n'est pas bloquée.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token manquant' });
  }

  try {
    const verifyUrl = process.env.NEXT_PUBLIC_DAZNO_VERIFY_URL || 'https://dazno.de/api/auth/verify-session';

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return res.status(401).json({ authenticated: false, error: 'Token invalide' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erreur proxy Dazno verify:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
