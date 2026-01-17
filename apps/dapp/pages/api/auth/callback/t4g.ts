import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Route pour gérer le callback OAuth t4g
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
    const clientId = process.env.CLIENT_ID || process.env.NEXT_PUBLIC_T4G_CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const authUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_T4G_AUTH_URL;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/auth/callback/t4g`;

    if (!clientId || !clientSecret || !authUrl) {
      console.error('Configuration OAuth t4g incomplète');
      return res.status(500).json({ error: 'Configuration OAuth incomplète' });
    }

    // Étape 1 : Échanger le code contre un access token
    const tokenEndpoint = `${authUrl}/token`;
    const tokenResponse = await fetch(tokenEndpoint, {
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
      console.error('Erreur échange token t4g:', errorText);
      return res.status(401).json({ error: 'Échec échange token t4g' });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Étape 2 : Récupérer les informations utilisateur avec l'access token
    const userInfoEndpoint = `${authUrl}/userinfo`;
    const userInfoResponse = await fetch(userInfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('Erreur récupération userinfo t4g:', errorText);
      return res.status(401).json({ error: 'Échec récupération profil t4g' });
    }

    const userInfo = await userInfoResponse.json();

    // Étape 3 : Retourner les données utilisateur standardisées
    const userData = {
      email: userInfo.email,
      given_name: userInfo.given_name || userInfo.firstName || '',
      family_name: userInfo.family_name || userInfo.lastName || '',
      name: userInfo.name || `${userInfo.given_name || userInfo.firstName || ''} ${userInfo.family_name || userInfo.lastName || ''}`.trim(),
      sub: userInfo.sub || userInfo.id, // ID t4g unique
      picture: userInfo.picture || '',
    };

    return res.status(200).json(userData);

  } catch (error) {
    console.error('Erreur callback t4g:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}
