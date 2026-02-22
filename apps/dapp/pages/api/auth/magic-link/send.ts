import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { Resend } from 'resend';

const EXPIRES_IN_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Génère un token signé stateless (HMAC-SHA256).
 * Format : base64url(payload).<signature>
 * Pas de stockage nécessaire — fonctionne sur serverless/Vercel.
 */
export function createMagicToken(email: string): string {
  const secret = process.env.MAGIC_LINK_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-dev-secret';
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + EXPIRES_IN_MS })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/**
 * Vérifie un token signé et retourne l'email si valide.
 * Retourne null si le token est invalide ou expiré.
 */
export function verifyMagicToken(token: string): string | null {
  try {
    const secret = process.env.MAGIC_LINK_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-dev-secret';
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;

    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;

    const { email, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!email || !exp || Date.now() > exp) return null;

    return email as string;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Adresse email invalide' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const token = createMagicToken(normalizedEmail);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:4200';
  const magicLink = `${appUrl}/auth/callback/magic-link?token=${token}`;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || 'Token For Good <t4g@dazno.de>';

    if (!resendApiKey) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Magic Link (dev mode):', magicLink);
        return res.status(200).json({
          success: true,
          message: 'Email envoyé',
          dev_link: magicLink,
        });
      }
      return res.status(500).json({ error: 'Configuration email manquante (RESEND_API_KEY)' });
    }

    const resend = new Resend(resendApiKey);

    await resend.emails.send({
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
