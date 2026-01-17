import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Route pour gérer le callback OAuth LinkedIn
 * Échange le code d'autorisation contre un access token et récupère les infos utilisateur
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Autoriser seulement POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code manquant' });
    }

    // Récupérer les credentials OAuth depuis les variables d'environnement
    const clientId = process.env.LINKEDIN_CLIENT_ID || process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/auth/callback/linkedin`;

    if (!clientId || !clientSecret) {
      console.error('LINKEDIN_CLIENT_ID ou LINKEDIN_CLIENT_SECRET manquant');
      return res.status(500).json({ error: 'Configuration OAuth incomplète' });
    }

    // Étape 1 : Échanger le code contre un access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Erreur échange token LinkedIn:', errorText);
      return res.status(401).json({ error: 'Échec échange token LinkedIn' });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Étape 2 : Récupérer les informations utilisateur avec l'access token
    // LinkedIn utilise OpenID Connect, donc on peut utiliser le endpoint userinfo
    const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('Erreur récupération userinfo LinkedIn:', errorText);
      return res.status(401).json({ error: 'Échec récupération profil LinkedIn' });
    }

    const userInfo = await userInfoResponse.json();

    // Étape 3 : Retourner les données utilisateur standardisées
    const userData = {
      email: userInfo.email,
      given_name: userInfo.given_name || '',
      family_name: userInfo.family_name || '',
      name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
      sub: userInfo.sub, // ID LinkedIn unique
      picture: userInfo.picture || '',
    };

    return res.status(200).json(userData);

  } catch (error) {
    console.error('Erreur callback LinkedIn:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}
