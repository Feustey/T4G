import React, { useEffect, useState, useCallback, useRef } from 'react';

interface LNURLAuthModalProps {
  onSuccess: (pubkey: string, userData: { sub: string; name: string; given_name: string; family_name: string; email: string }) => void;
  onClose: () => void;
}

type ModalStatus = 'loading' | 'waiting' | 'scanning' | 'error' | 'expired';

export default function LNURLAuthModal({ onSuccess, onClose }: LNURLAuthModalProps) {
  const [status, setStatus] = useState<ModalStatus>('loading');
  const [lnurl, setLnurl] = useState<string | null>(null);
  const [k1, setK1] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const fetchChallenge = useCallback(async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/auth/lnurl/challenge');
      if (!response.ok) throw new Error('Erreur génération challenge');
      const data = await response.json();
      if (!mountedRef.current) return;
      setLnurl(data.lnurl);
      setK1(data.k1);
      setStatus('waiting');
    } catch (err) {
      if (!mountedRef.current) return;
      setErrorMessage(err instanceof Error ? err.message : 'Erreur inconnue');
      setStatus('error');
    }
  }, []);

  // Polling du statut
  useEffect(() => {
    if (status !== 'waiting' || !k1) return;

    // Countdown 5 minutes
    setTimeLeft(300);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearPolling();
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Poll toutes les 2 secondes
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/auth/lnurl/status?k1=${k1}`);
        if (!mountedRef.current) return;

        if (response.status === 410) {
          clearPolling();
          setStatus('expired');
          return;
        }

        if (!response.ok) return;

        const data = await response.json();

        if (data.status === 'verified') {
          clearPolling();
          setStatus('scanning'); // Brève animation de succès
          setTimeout(() => {
            if (mountedRef.current) {
              onSuccess(data.pubkey, {
                sub: data.sub,
                name: data.name,
                given_name: data.given_name,
                family_name: data.family_name,
                email: data.email,
              });
            }
          }, 800);
        }
      } catch {
        // Ignorer les erreurs réseau temporaires dans le polling
      }
    }, 2000);

    return () => clearPolling();
  }, [status, k1, clearPolling, onSuccess]);

  useEffect(() => {
    mountedRef.current = true;
    fetchChallenge();
    return () => {
      mountedRef.current = false;
      clearPolling();
    };
  }, [fetchChallenge, clearPolling]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // URL QR code via service externe (pas de dépendance)
  const qrUrl = lnurl ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(lnurl)}` : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Connexion via Lightning (LNURL-Auth)"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', lineHeight: 1 }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
          <h2 style={{ margin: 0, fontSize: 20, color: '#1a1a2e' }}>Connexion Lightning</h2>
          <p style={{ margin: '6px 0 0', color: '#888', fontSize: 14 }}>Scannez avec votre wallet Lightning</p>
        </div>

        {/* Contenu principal */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #f7931a', borderRadius: '50%', animation: 'lnurlSpin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#888', margin: 0 }}>Génération du QR code...</p>
          </div>
        )}

        {(status === 'waiting' || status === 'scanning') && qrUrl && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="QR Code LNURL-Auth"
                width={220}
                height={220}
                style={{ display: 'block', borderRadius: 12, border: '2px solid #f0f0f0', opacity: status === 'scanning' ? 0.5 : 1, transition: 'opacity 0.3s' }}
              />
              {status === 'scanning' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                  ✅
                </div>
              )}
            </div>

            {/* Countdown */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16, color: timeLeft < 60 ? '#e53e3e' : '#888', fontSize: 13 }}>
              <span>⏱</span>
              <span>Expire dans {formatTime(timeLeft)}</span>
            </div>

            {/* LNURL textuel */}
            <details style={{ textAlign: 'left', marginBottom: 12 }}>
              <summary style={{ fontSize: 12, color: '#aaa', cursor: 'pointer', userSelect: 'none' }}>Afficher le lien LNURL</summary>
              <code style={{ display: 'block', fontSize: 10, wordBreak: 'break-all', color: '#666', background: '#f8f8f8', padding: '8px', borderRadius: 6, marginTop: 6 }}>
                {lnurl}
              </code>
            </details>

            {/* Wallets compatibles */}
            <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>
              Compatible : Phoenix, Breez, Zeus, Muun, BlueWallet...
            </p>
          </div>
        )}

        {status === 'expired' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏰</div>
            <p style={{ color: '#e53e3e', fontWeight: 600, marginBottom: 8 }}>Challenge expiré</p>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>Le QR code a expiré après 5 minutes.</p>
            <button
              onClick={fetchChallenge}
              style={{ background: '#f7931a', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
            >
              Générer un nouveau QR code
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
            <p style={{ color: '#e53e3e', fontWeight: 600, marginBottom: 8 }}>Erreur</p>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>{errorMessage}</p>
            <button
              onClick={fetchChallenge}
              style={{ background: '#f7931a', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
            >
              Réessayer
            </button>
          </div>
        )}

        <style>{`
          @keyframes lnurlSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        `}</style>
      </div>
    </div>
  );
}
