import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code manquant' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    // Dériver l'origine depuis le header Host de la requête pour que le redirect_uri
    // corresponde exactement à l'URL depuis laquelle l'utilisateur a lancé le flow OAuth.
    // NEXT_PUBLIC_APP_URL peut différer du domaine réel (ex: www. vs app.)
    const host = req.headers.host || '';
    const proto = req.headers['x-forwarded-proto'] || (host.startsWith('localhost') ? 'http' : 'https');
    const origin = `${proto}://${host}`;
    const redirectUri = `${origin}/auth/callback/github`;

    if (process.env.NODE_ENV === 'development') {
      console.log('🔵 GitHub OAuth Callback - Configuration:');
      console.log('  - clientId:', clientId ? '✅' : '❌ Manquant');
      console.log('  - clientSecret:', clientSecret ? '✅' : '❌ Manquant');
      console.log('  - redirectUri:', redirectUri);
    }

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        error: 'Configuration OAuth incomplète',
        details: 'GITHUB_CLIENT_ID ou GITHUB_CLIENT_SECRET manquant',
      });
    }

    // Étape 1 : Échanger le code contre un access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      return res.status(401).json({ error: 'Échec échange token GitHub' });
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(401).json({ error: tokenData.error_description || 'Token GitHub invalide' });
    }

    const accessToken = tokenData.access_token;

    // Étape 2 : Récupérer le profil GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      return res.status(401).json({ error: 'Échec récupération profil GitHub' });
    }

    const githubUser = await userResponse.json();

    // Étape 3 : Récupérer l'email (peut être privé sur GitHub)
    let email = githubUser.email;
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (emailsResponse.ok) {
        const emails: Array<{ email: string; primary: boolean; verified: boolean }> = await emailsResponse.json();
        const primaryEmail = emails.find((e) => e.primary && e.verified);
        email = primaryEmail?.email || emails[0]?.email || '';
      }
    }

    const nameParts = (githubUser.name || githubUser.login || '').split(' ');
    const given_name = nameParts[0] || githubUser.login || '';
    const family_name = nameParts.slice(1).join(' ');

    return res.status(200).json({
      email,
      given_name,
      family_name,
      name: githubUser.name || githubUser.login,
      sub: `github_${githubUser.id}`,
      picture: githubUser.avatar_url || '',
      login: githubUser.login,
    });
  } catch (error) {
    console.error('Erreur callback GitHub:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
}
