import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Stockage en mémoire des tokens magic link
// Production : utiliser PostgreSQL ou Redis
const magicLinkTokens = new Map<string, { email: string; expires: number }>();

// Nettoyage automatique des tokens expirés
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of magicLinkTokens.entries()) {
    if (data.expires < now) {
      magicLinkTokens.delete(token);
    }
  }
}, 60_000);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Adresse email invalide' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Générer un token sécurisé (32 octets = 64 chars hex)
  const token = crypto.randomBytes(32).toString('hex');
  const expiresIn = 15 * 60 * 1000; // 15 minutes

  magicLinkTokens.set(token, {
    email: normalizedEmail,
    expires: Date.now() + expiresIn,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:4200';
  const magicLink = `${appUrl}/auth/callback/magic-link?token=${token}`;

  try {
    const emailServer = process.env.EMAIL_SERVER;
    const emailFrom = process.env.EMAIL_FROM || 'Token For Good <noreply@token-for-good.com>';

    if (!emailServer) {
      // Mode développement : retourner le lien directement
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Magic Link (dev mode):', magicLink);
        return res.status(200).json({
          success: true,
          message: 'Email envoyé',
          // Uniquement en dev pour faciliter les tests
          dev_link: magicLink,
        });
      }
      return res.status(500).json({ error: 'Configuration email manquante (EMAIL_SERVER)' });
    }

    const transporter = nodemailer.createTransport(emailServer);

    await transporter.sendMail({
      from: emailFrom,
      to: normalizedEmail,
      subject: 'Votre lien de connexion Token4Good',
      text: `Cliquez sur ce lien pour vous connecter (valable 15 minutes) :\n\n${magicLink}\n\nSi vous n'avez pas demandé ce lien, ignorez cet email.`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
            <img src="${appUrl}/logo.png" alt="Token4Good" style="height: 40px; margin-bottom: 24px;" />
            <h2 style="margin-bottom: 8px;">Connexion à Token4Good</h2>
            <p style="color: #666; margin-bottom: 24px;">Cliquez sur le bouton ci-dessous pour vous connecter. Ce lien est valable <strong>15 minutes</strong>.</p>
            <a href="${magicLink}" style="display: inline-block; background: #f7931a; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Se connecter →
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 32px;">
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
              <a href="${magicLink}" style="color: #f7931a; word-break: break-all;">${magicLink}</a>
            </p>
            <p style="color: #999; font-size: 12px;">Si vous n'avez pas demandé cette connexion, ignorez cet email.</p>
          </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true, message: 'Email envoyé avec succès' });
  } catch (error) {
    console.error('Erreur envoi magic link:', error);
    return res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
  }
}

// Exporter la map pour la route verify
export { magicLinkTokens };
