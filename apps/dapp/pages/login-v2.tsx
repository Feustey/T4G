import { useState } from 'react';
import { useRouter } from 'next/router';
import { useOAuth } from '../hooks/useOAuth';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Login.module.css';

export default function LoginV2() {
  const router = useRouter();
  const { loginWitht4g, loginWithLinkedIn, loginWithDazno } = useOAuth();
  const { loading } = useAuth();
  const [daznoToken, setDaznoToken] = useState('');
  const [error, setError] = useState('');

  const handleDaznoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!daznoToken) {
      setError('Veuillez entrer votre token Dazno');
      return;
    }

    try {
      await loginWithDazno(daznoToken);
    } catch (err) {
      setError('Erreur de connexion avec Dazno. Veuillez vérifier votre token.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1>Token4Good</h1>
        <h2>Connexion</h2>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.providers}>
          {/* t4g OAuth */}
          <button
            onClick={loginWitht4g}
            disabled={loading}
            className={styles.providerButton}
            style={{ backgroundColor: '#004B87' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path d="M10 0L0 5v10c0 6.25 10 5 10 5s10 1.25 10-5V5L10 0z"/>
            </svg>
            Se connecter avec t4g
          </button>

          {/* LinkedIn OAuth */}
          <button
            onClick={loginWithLinkedIn}
            disabled={loading}
            className={styles.providerButton}
            style={{ backgroundColor: '#0077B5' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            Se connecter avec LinkedIn
          </button>

          {/* Dazno Token */}
          <form onSubmit={handleDaznoLogin} className={styles.daznoForm}>
            <input
              type="text"
              placeholder="Token Dazno"
              value={daznoToken}
              onChange={(e) => setDaznoToken(e.target.value)}
              className={styles.input}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !daznoToken}
              className={styles.providerButton}
              style={{ backgroundColor: '#2D3748' }}
            >
              Se connecter avec Dazno
            </button>
          </form>
        </div>

        <div className={styles.footer}>
          <p>🔒 Authentification sécurisée via JWT</p>
          <p>🌐 Powered by Token4Good v2 - Backend Rust</p>
        </div>
      </div>
    </div>
  );
}
