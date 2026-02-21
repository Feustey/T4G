import React, { useEffect, useState } from 'react';
import * as process from 'process';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LangType, LocaleType } from '../types';
import PublicLayout from '../layouts/PublicLayout';
import { useIndexing, useOAuth } from '../hooks';
import { GetServerSideProps } from 'next';
import OnboardingLayout from '../layouts/OnboardingLayout';
import { Button } from '../components';
import { checkDaznoSession } from '../utils/dazeno-auth';
import { useAuth } from '../contexts/AuthContext';
import dynamic from 'next/dynamic';

const LNURLAuthModal = dynamic(() => import('../components/auth/LNURLAuthModal'), { ssr: false });

export interface IPage {
  lang: LangType;
}

// Icône GitHub SVG inline (pas de dépendance icône)
function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

export function Page({ lang }: IPage) {
  const router = useRouter();
  const locale = router.locale as LocaleType;
  const { login, isAuthenticated, user } = useAuth();
  const { loginWithLinkedIn, loginWithDazno, loginWithGitHub, sendMagicLink } = useOAuth();

  const [debugButtonsVisible, setDebugButtonsVisible] = useState<boolean>(false);
  const [isDazenoUser, setIsDazenoUser] = useState<boolean>(false);
  const [isCheckingDazeno, setIsCheckingDazeno] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Magic Link
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);
  const [magicLinkDevLink, setMagicLinkDevLink] = useState<string | null>(null);

  // LNURL-Auth modal
  const [showLNURL, setShowLNURL] = useState(false);

  useEffect(() => {
    if (process.env.NEXTAUTH_URL !== 'token-for-good.com') {
      setDebugButtonsVisible(
        process.env.NODE_ENV === 'development' || router.query.debug != undefined
      );
    } else {
      setDebugButtonsVisible(false);
    }

    const checkDazno = async () => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          setIsCheckingDazeno(false);
          return;
        }
      }

      setIsCheckingDazeno(true);
      try {
        const daznoSession = await checkDaznoSession();
        if (daznoSession.authenticated && daznoSession.token) {
          await login('dazno', { token: daznoSession.token });
        } else if (daznoSession.authenticated) {
          setIsDazenoUser(true);
        }
      } catch (error) {
        console.error('Erreur vérification Dazno:', error);
      } finally {
        setIsCheckingDazeno(false);
      }
    };

    checkDazno();
  }, [router.query.debug, locale, login]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.is_onboarded === true) {
        router.push(`/${locale}/`);
      } else {
        router.push(`/${locale}/onboarding`);
      }
    }
  }, [isAuthenticated, user, locale, router]);

  if (typeof window !== 'undefined') {
    const url = new URLSearchParams(window.location.search).get('callbackUrl');
    if (url) {
      window.location.href = url;
    }
  }

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicLinkEmail || magicLinkLoading) return;

    setMagicLinkLoading(true);
    setMagicLinkError(null);

    try {
      const result = await sendMagicLink(magicLinkEmail);
      setMagicLinkSent(true);
      if (result.dev_link) {
        setMagicLinkDevLink(result.dev_link);
      }
    } catch (err) {
      setMagicLinkError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handleLNURLSuccess = async (
    pubkey: string,
    userData: { sub: string; name: string; given_name: string; family_name: string; email: string }
  ) => {
    setShowLNURL(false);
    setIsLoggingIn(true);
    try {
      await login('lnurl', { providerUserData: { ...userData, pubkey } });
    } catch (err) {
      console.error('Erreur login LNURL:', err);
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <Head>
        <title>{lang.page.user.login.head.title}</title>
        {useIndexing(false)}
        <style>{`
          .auth-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            max-width: 320px;
            padding: 13px 20px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.15s ease;
            text-decoration: none;
          }
          .auth-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
          .auth-btn:active:not(:disabled) { transform: translateY(0); }
          .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
          .auth-divider {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            max-width: 320px;
            color: #bbb;
            font-size: 13px;
          }
          .auth-divider::before, .auth-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #e8e8e8;
          }
        `}</style>
      </Head>
      <OnboardingLayout lang={lang}>
        <div className="e-page-layout" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {isCheckingDazeno ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#888' }}>Vérification de la session Dazno...</p>
            </div>
          ) : isDazenoUser ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: 8 }}>Vous êtes déjà connecté via Dazno.de</p>
              <p style={{ color: '#888' }}>Redirection en cours...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%', padding: '0 16px' }}>

              {/* Titre */}
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: '#1a1a2e' }}>Se connecter</h1>
                <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Choisissez votre méthode de connexion</p>
              </div>

              {/* ⚡ LNURL-Auth — Lightning (option phare) */}
              <button
                className="auth-btn"
                disabled={isLoggingIn}
                onClick={() => setShowLNURL(true)}
                style={{ background: '#f7931a', color: 'white' }}
              >
                <LightningIcon />
                Connexion Lightning (LNURL-Auth)
              </button>

              <div className="auth-divider">ou</div>

              {/* GitHub */}
              <button
                className="auth-btn"
                disabled={isLoggingIn}
                onClick={() => {
                  setIsLoggingIn(true);
                  try {
                    loginWithGitHub();
                  } catch {
                    setIsLoggingIn(false);
                  }
                }}
                style={{ background: '#24292e', color: 'white' }}
              >
                <GitHubIcon />
                Continuer avec GitHub
              </button>

              <div className="auth-divider">ou</div>

              {/* Magic Link Email */}
              {!magicLinkSent ? (
                <form
                  onSubmit={handleMagicLinkSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <EmailIcon />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#444' }}>Lien magique par email</span>
                  </div>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    required
                    disabled={magicLinkLoading || isLoggingIn}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #e0e0e0',
                      fontSize: 15,
                      outline: 'none',
                      width: '100%',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#f7931a')}
                    onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                  />
                  {magicLinkError && (
                    <p style={{ color: '#e53e3e', fontSize: 13, margin: 0 }}>{magicLinkError}</p>
                  )}
                  <button
                    type="submit"
                    className="auth-btn"
                    disabled={magicLinkLoading || !magicLinkEmail || isLoggingIn}
                    style={{ background: '#4a5568', color: 'white', marginTop: 2 }}
                  >
                    {magicLinkLoading ? 'Envoi en cours...' : 'Envoyer le lien de connexion'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', maxWidth: 320, padding: '20px 16px', background: '#f0fff4', borderRadius: 12, border: '1.5px solid #9ae6b4' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📬</div>
                  <p style={{ fontWeight: 600, color: '#276749', marginBottom: 4 }}>Email envoyé !</p>
                  <p style={{ color: '#4a7766', fontSize: 13, margin: 0 }}>
                    Vérifiez votre boite mail sur <strong>{magicLinkEmail}</strong>.
                    Le lien est valable 15 minutes.
                  </p>
                  {magicLinkDevLink && (
                    <a
                      href={magicLinkDevLink}
                      style={{ display: 'inline-block', marginTop: 12, fontSize: 12, color: '#f7931a', wordBreak: 'break-all' }}
                    >
                      [DEV] Cliquez ici pour tester le lien
                    </a>
                  )}
                  <button
                    onClick={() => { setMagicLinkSent(false); setMagicLinkEmail(''); setMagicLinkDevLink(null); }}
                    style={{ background: 'none', border: 'none', color: '#888', fontSize: 12, marginTop: 10, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Utiliser une autre adresse
                  </button>
                </div>
              )}

              <div className="auth-divider">ou</div>

              {/* Daznode (option existante) */}
              <button
                className="auth-btn"
                disabled={isLoggingIn}
                onClick={async () => {
                  setIsLoggingIn(true);
                  try {
                    await loginWithDazno();
                  } catch {
                    setIsLoggingIn(false);
                  }
                }}
                style={{ background: 'white', color: '#444', border: '1.5px solid #e0e0e0' }}
              >
                Login with Daznode
              </button>

            </div>
          )}
        </div>

        {/* Debug buttons */}
        {debugButtonsVisible && (
          <div style={{ position: 'fixed', bottom: 100, right: 24, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(['admin', 'alumni', 'student'] as const).map((role) => (
              <Button
                key={role}
                label={`Login as ${role}`}
                variant="secondary"
                onClick={async (e) => {
                  e.preventDefault();
                  setIsLoggingIn(true);
                  try {
                    const email = `test.${role}.${Date.now()}@token-for-good.com`;
                    await login('custom', { email, password: role });
                    await router.push(`/${locale}/onboarding`);
                  } catch (error) {
                    console.error(`Erreur login ${role}:`, error);
                    const message = error instanceof Error ? error.message : 'Erreur de connexion';
                    alert(message);
                    setIsLoggingIn(false);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Modal LNURL-Auth */}
        {showLNURL && (
          <LNURLAuthModal
            onSuccess={handleLNURLSuccess}
            onClose={() => setShowLNURL(false)}
          />
        )}
      </OnboardingLayout>
    </>
  );
}

export default Page;

export const getServerSideProps: GetServerSideProps = async function (context) {
  const { callbackUrl } = context.query;
  console.log(callbackUrl);
  return { props: {} };
};
