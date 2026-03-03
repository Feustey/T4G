import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSwr from 'swr';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClient';
import { activateUserWallet, resizeFile } from '../services';

const STEP_LABELS = ['Identité', 'Rôle & Thèmes', 'Profil'];

type MentorMode = 'mentee' | 'mentor' | 'both' | null;

export function Onboarding() {
  const router = useRouter();
  const locale = router.locale || 'fr';
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [mentorMode, setMentorMode] = useState<MentorMode>(null);
  const [selectedLearningTopics, setSelectedLearningTopics] = useState<string[]>([]);
  const [selectedMentorTopics, setSelectedMentorTopics] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: learningTopics = [] } = useSwr(
    step === 2 ? 'learning-topics' : null,
    () => apiClient.getLearningTopics(),
    { revalidateOnFocus: false }
  );

  // Pré-remplir depuis les données existantes
  useEffect(() => {
    if (user) {
      if (user.firstname) setFirstname(user.firstname);
      if (user.lastname) setLastname(user.lastname);
    }
  }, [user]);

  const toggleTopic = (
    slug: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const resized = await resizeFile(file);
      setAvatar(resized as string);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.updateUser(user.id, {
        firstname,
        lastname,
        bio: bio || undefined,
        avatar: avatar || undefined,
        is_onboarded: true,
        is_mentor_active: mentorMode === 'mentor' || mentorMode === 'both',
        mentor_topics: selectedMentorTopics,
        learning_topics: selectedLearningTopics,
      } as any);

      // Activer le wallet — ignorer l'erreur si le service est indisponible
      try {
        await activateUserWallet();
      } catch (_e) { /* wallet service indisponible — non bloquant */ }

      window.location.href = `/${locale}/dashboard/`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  };

  if (!user?.id) {
    return (
      <>
        <Head>
          <title>Onboarding — Token4Good</title>
        </Head>
        <div style={styles.centered}>
          <p>Chargement...</p>
        </div>
      </>
    );
  }

  if (isSubmitting) {
    return (
      <>
        <Head>
          <title>Finalisation — Token4Good</title>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </Head>
        <div style={styles.centered}>
          <div style={styles.spinner} />
          <p>Finalisation de votre profil...</p>
        </div>
      </>
    );
  }

  const isStep1Valid = firstname.trim().length > 0 && lastname.trim().length > 0;
  const isStep2Valid = mentorMode !== null;

  return (
    <>
      <Head>
        <title>Bienvenue sur Token4Good</title>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </Head>
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>Bienvenue sur Token4Good</h1>
          <p style={styles.subtitle}>Complétez votre profil pour commencer</p>

          {/* Indicateur de progression */}
          <div style={styles.stepRow}>
            {STEP_LABELS.map((label, idx) => {
              const num = idx + 1;
              const isDone = num < step;
              const isActive = num === step;
              return (
                <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        ...styles.stepCircle,
                        background: isDone || isActive ? '#f7931a' : '#e2e8f0',
                        color: isDone || isActive ? '#fff' : '#999',
                      }}
                    >
                      {isDone ? '✓' : num}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: isActive ? '#f7931a' : '#999',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      style={{
                        width: 40,
                        height: 2,
                        background: num < step ? '#f7931a' : '#e2e8f0',
                        margin: '0 4px 16px',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div style={styles.card}>
            {/* Étape 1 : Identité */}
            {step === 1 && (
              <div>
                <h2 style={styles.stepTitle}>Vos coordonnées</h2>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Prénom *</label>
                  <input
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    placeholder="Votre prénom"
                    style={styles.input}
                    autoFocus
                  />
                </div>
                <div style={{ ...styles.fieldGroup, marginBottom: '1.5rem' }}>
                  <label style={styles.label}>Nom *</label>
                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="Votre nom de famille"
                    style={styles.input}
                  />
                </div>
                <button
                  disabled={!isStep1Valid}
                  onClick={() => setStep(2)}
                  style={{
                    ...styles.btn,
                    background: isStep1Valid ? '#f7931a' : '#e2e8f0',
                    color: isStep1Valid ? '#fff' : '#999',
                    cursor: isStep1Valid ? 'pointer' : 'not-allowed',
                    width: '100%',
                  }}
                >
                  Continuer
                </button>
              </div>
            )}

            {/* Étape 2 : Rôle + Thèmes */}
            {step === 2 && (
              <div>
                <h2 style={styles.stepTitle}>Comment voulez-vous participer ?</h2>
                <p style={styles.hint}>Vous pourrez modifier ce choix depuis votre profil.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.5rem' }}>
                  {(
                    [
                      { key: 'mentee', label: 'Je veux apprendre', desc: 'Trouver un mentor sur un sujet précis' },
                      { key: 'mentor', label: 'Je veux transmettre', desc: 'Proposer des sessions de mentoring' },
                      { key: 'both', label: 'Les deux à la fois', desc: 'Apprendre et enseigner selon les sujets' },
                    ] as const
                  ).map(({ key, label, desc }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMentorMode(key)}
                      style={{
                        padding: '1rem',
                        borderRadius: 8,
                        textAlign: 'left',
                        cursor: 'pointer',
                        border: `2px solid ${mentorMode === key ? '#f7931a' : '#e2e8f0'}`,
                        background: mentorMode === key ? '#fff8f0' : 'transparent',
                      }}
                    >
                      <p style={{ fontWeight: 600, margin: 0 }}>{label}</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#666' }}>{desc}</p>
                    </button>
                  ))}
                </div>

                {(mentorMode === 'mentee' || mentorMode === 'both') && learningTopics.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>Sur quoi voulez-vous progresser ?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {learningTopics.map((t: { slug: string; name: string }) => (
                        <button
                          key={t.slug}
                          type="button"
                          onClick={() => toggleTopic(t.slug, setSelectedLearningTopics)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 999,
                            fontSize: 13,
                            cursor: 'pointer',
                            border: `2px solid ${selectedLearningTopics.includes(t.slug) ? '#f7931a' : '#e2e8f0'}`,
                            background: selectedLearningTopics.includes(t.slug) ? '#fff8f0' : 'transparent',
                          }}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(mentorMode === 'mentor' || mentorMode === 'both') && learningTopics.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>Sur quoi pouvez-vous aider ?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {learningTopics.map((t: { slug: string; name: string }) => (
                        <button
                          key={t.slug}
                          type="button"
                          onClick={() => toggleTopic(t.slug, setSelectedMentorTopics)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 999,
                            fontSize: 13,
                            cursor: 'pointer',
                            border: `2px solid ${selectedMentorTopics.includes(t.slug) ? '#f7931a' : '#e2e8f0'}`,
                            background: selectedMentorTopics.includes(t.slug) ? '#fff8f0' : 'transparent',
                          }}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.btnRow}>
                  <button onClick={() => setStep(1)} style={styles.btnSecondary}>
                    Retour
                  </button>
                  <button
                    disabled={!isStep2Valid}
                    onClick={() => setStep(3)}
                    style={{
                      ...styles.btn,
                      flex: 1,
                      background: isStep2Valid ? '#f7931a' : '#e2e8f0',
                      color: isStep2Valid ? '#fff' : '#999',
                      cursor: isStep2Valid ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* Étape 3 : Profil optionnel + soumission */}
            {step === 3 && (
              <div>
                <h2 style={styles.stepTitle}>Votre profil</h2>
                <p style={styles.hint}>Ces informations sont optionnelles et modifiables depuis votre profil.</p>

                <div style={{ ...styles.fieldGroup, marginBottom: '1.5rem' }}>
                  <label style={styles.label}>Photo de profil</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="avatar"
                        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          background: '#f7931a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 24,
                          flexShrink: 0,
                        }}
                      >
                        {firstname.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <label style={{ cursor: 'pointer', color: '#f7931a', fontWeight: 600, fontSize: 14 }}>
                      Choisir une photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>

                <div style={{ ...styles.fieldGroup, marginBottom: '1.5rem' }}>
                  <label style={styles.label}>Biographie</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Parlez-nous de vous en quelques mots..."
                    rows={4}
                    style={{ ...styles.input, resize: 'vertical', height: 'auto' }}
                  />
                </div>

                {error && (
                  <p style={{ color: '#e53e3e', marginBottom: '1rem', fontSize: 14 }}>{error}</p>
                )}

                <p style={{ fontSize: 12, color: '#999', textAlign: 'center', marginBottom: '1rem' }}>
                  En continuant, vous acceptez la{' '}
                  <a
                    href="https://www.token-for-good.com/confidentialite"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#f7931a' }}
                  >
                    politique de confidentialité
                  </a>
                </p>

                <div style={styles.btnRow}>
                  <button onClick={() => setStep(2)} style={styles.btnSecondary}>
                    Retour
                  </button>
                  <button
                    onClick={handleSubmit}
                    style={{ ...styles.btn, flex: 1, background: '#f7931a', color: '#fff', cursor: 'pointer' }}
                  >
                    Commencer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Onboarding;

Onboarding.auth = true;
Onboarding.role = ['alumni', 'mentee', 'mentor', 'service_provider'];

export const getServerSideProps: GetServerSideProps = () =>
  Promise.resolve({ props: {} });

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f8f9fa',
    fontFamily: 'system-ui, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '2rem 1rem',
  },
  container: {
    width: '100%',
    maxWidth: 480,
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'system-ui, sans-serif',
  },
  title: {
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '2rem',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    margin: '0 auto 4px',
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: '2rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  stepTitle: {
    marginBottom: '0.5rem',
  },
  hint: {
    color: '#666',
    marginBottom: '1.5rem',
    fontSize: 14,
  },
  fieldGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontWeight: 600,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    fontSize: 16,
    boxSizing: 'border-box',
    color: '#1a202c',
  },
  btnRow: {
    display: 'flex',
    gap: 12,
    marginTop: '1.5rem',
  },
  btn: {
    padding: '0.875rem',
    borderRadius: 8,
    border: 'none',
    fontWeight: 700,
    fontSize: 16,
  },
  btnSecondary: {
    flex: 1,
    padding: '0.875rem',
    borderRadius: 8,
    border: '2px solid #e2e8f0',
    background: 'transparent',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
  },
  spinner: {
    width: 48,
    height: 48,
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #f7931a',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: 20,
  },
};
