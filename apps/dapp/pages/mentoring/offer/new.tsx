import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSwr from 'swr';
import ConnectedLayout from '../../../layouts/ConnectedLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { useIndexing } from '../../../hooks';
import { Breadcrumb, Button, Spinner } from '../../../components';
import { AuthPageType, LangType } from '../../../types';
import {
  apiClient,
  LearningTopic,
  CreateMentoringOfferRequest,
  TimeSlot,
} from '../../../services/apiClient';

interface IPage {
  lang: LangType;
}

const DURATIONS = [30, 45, 60, 90] as const;
const FORMATS = [
  { value: 'video', label: 'Visio', icon: '📹', desc: 'Appel vidéo (Zoom, Meet…)' },
  { value: 'text',  label: 'Chat',  icon: '💬', desc: 'Échange texte asynchrone ou synchrone' },
  { value: 'async', label: 'Asynchrone', icon: '📼', desc: 'Enregistrement vidéo + commentaires' },
] as const;

const LEVELS = [
  { value: 'beginner',     label: 'Débutant',      desc: 'Aucune connaissance préalable' },
  { value: 'intermediate', label: 'Intermédiaire', desc: 'Bases acquises, cherche à approfondir' },
  { value: 'advanced',     label: 'Avancé',        desc: 'Expérience solide, sujets complexes' },
] as const;

// Prochains créneaux à J+1, J+3, J+7, J+14
function defaultSlots(durationMinutes: number): TimeSlot[] {
  const offsets = [1, 3, 7, 14];
  return offsets.map((d) => {
    const date = new Date();
    date.setDate(date.getDate() + d);
    date.setHours(14, 0, 0, 0);
    return { date: date.toISOString(), duration_minutes: durationMinutes };
  });
}

type Step = 1 | 2 | 3;

interface FormState {
  topic_slug: string;
  topic_name: string;
  target_level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  duration_minutes: number;
  format: 'video' | 'text' | 'async';
  token_cost: number;
  on_demand: boolean;
  slots: TimeSlot[];
}

const Page: React.FC<IPage> & AuthPageType = ({ lang }: IPage) => {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    topic_slug: '',
    topic_name: '',
    target_level: 'beginner',
    description: '',
    duration_minutes: 60,
    format: 'video',
    token_cost: user?.mentor_tokens_per_hour ?? 60,
    on_demand: false,
    slots: defaultSlots(60),
  });

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Fetch topics depuis l'API
  const { data: topics = [], isLoading: isLoadingTopics } = useSwr<LearningTopic[]>(
    '/api/learning/topics',
    () => apiClient.getLearningTopics(),
    { revalidateOnFocus: false }
  );

  // Grouper par catégorie
  const topicsByCategory = topics.reduce<Record<string, LearningTopic[]>>((acc, t) => {
    const cat = t.category?.name ?? 'Autres';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  // Appel de hook au niveau du composant (pas dans un return conditionnel)
  const noIndexMeta = useIndexing(false);

  const step1Valid = !!form.topic_slug && !!form.target_level;
  const step2Valid = form.duration_minutes > 0 && form.token_cost >= 0 && !!form.format;

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const payload: CreateMentoringOfferRequest = {
        topic_slug:       form.topic_slug,
        target_level:     form.target_level,
        description:      form.description || undefined,
        duration_minutes: form.duration_minutes,
        format:           form.format,
        token_cost:       form.token_cost,
        availability:     form.on_demand ? [] : form.slots,
      };
      await apiClient.createMentoringOffer(payload);
      router.push('/mentoring/my-sessions?role=mentor&created=1');
    } catch (e: any) {
      setError(e.message ?? 'Une erreur est survenue. Réessaie.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepTitles: string[] = ['Sujet', 'Modalités', 'Confirmation'];

  if (isSubmitting) {
    return (
      <>
        <Head><title>Proposer une session — Token4Good</title>{noIndexMeta}</Head>
        <Spinner lang={lang} spinnerText="Publication de ta session..." size="lg" />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Proposer une session — Token4Good</title>
        {noIndexMeta}
      </Head>

      <ConnectedLayout user={user} lang={lang}>
        <Breadcrumb
          links={[
            { text: 'Dashboard', link: '/dashboard', parent: true },
            { text: 'Mentoring', link: '/mentoring', parent: true },
            { text: 'Proposer une session' },
          ]}
        />

        <h1 className="heading-2">Proposer une session de mentoring</h1>

        {/* Indicateur de progression */}
        <div className="u-d--flex u-align-items-center u-gap--s" style={{ marginBottom: '1.5rem' }}>
          {stepTitles.map((title, idx) => {
            const n = (idx + 1) as Step;
            const isDone   = n < step;
            const isActive = n === step;
            return (
              <React.Fragment key={n}>
                <div
                  className="u-d--flex u-flex-column u-align-items-center u-gap--xs"
                  style={{ cursor: isDone ? 'pointer' : 'default' }}
                  onClick={() => isDone && setStep(n)}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14,
                    background: isDone || isActive ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)',
                    color: isDone || isActive ? '#fff' : 'var(--color-text-secondary, #666)',
                    transition: 'all 0.2s',
                  }}>
                    {isDone ? '✓' : n}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--color-primary, #2563eb)' : 'var(--color-text-secondary, #999)' }}>
                    {title}
                  </span>
                </div>
                {idx < stepTitles.length - 1 && (
                  <div style={{ flex: 1, height: 2, maxWidth: 48, background: n < step ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)', transition: 'background 0.3s' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="o-card u-d--flex u-flex-column u-gap--m" style={{ maxWidth: 640 }}>

          {/* ── Étape 1 : Sujet ── */}
          {step === 1 && (
            <>
              <h2 className="heading-3" style={{ margin: 0 }}>Sur quel sujet veux-tu enseigner ?</h2>

              {isLoadingTopics ? (
                <Spinner lang={lang} spinnerText="Chargement des thèmes…" />
              ) : (
                <div className="u-d--flex u-flex-column u-gap--m">
                  {Object.entries(topicsByCategory).map(([catName, catTopics]) => (
                    <div key={catName}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: '0 0 8px', color: 'var(--color-text-secondary, #64748b)' }}>
                        {catName}
                      </p>
                      <div className="u-d--flex u-flex-column u-gap--xs">
                        {catTopics.map((t) => (
                          <button
                            key={t.slug}
                            type="button"
                            onClick={() => { set('topic_slug', t.slug); set('topic_name', t.name); set('description', t.description ?? ''); }}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '0.5rem',
                              border: `2px solid ${form.topic_slug === t.slug ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)'}`,
                              background: form.topic_slug === t.slug ? 'var(--color-primary-light, #eff6ff)' : 'transparent',
                              textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}
                          >
                            <span style={{ fontWeight: form.topic_slug === t.slug ? 600 : 400 }}>{t.name}</span>
                            <span style={{
                              fontSize: 11, padding: '2px 8px', borderRadius: '999px',
                              background: form.topic_slug === t.slug ? 'var(--color-primary, #2563eb)' : 'var(--color-surface-secondary, #f1f5f9)',
                              color: form.topic_slug === t.slug ? '#fff' : 'var(--color-text-secondary, #64748b)',
                            }}>
                              {{ beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' }[t.level]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {form.topic_slug && (
                <>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
                      Niveau ciblé pour les apprenants
                    </label>
                    <div className="u-d--flex u-flex-column u-gap--xs">
                      {LEVELS.map(({ value, label, desc }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => set('target_level', value)}
                          style={{
                            padding: '10px 14px', borderRadius: '0.5rem', textAlign: 'left', cursor: 'pointer',
                            border: `2px solid ${form.target_level === value ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)'}`,
                            background: form.target_level === value ? 'var(--color-primary-light, #eff6ff)' : 'transparent',
                            transition: 'all 0.15s',
                          }}
                        >
                          <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
                      Description personnalisée <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)' }}>(optionnel)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Décris ce que tu vas apporter, ton approche, ce que l'apprenant va repartir avec…"
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: '0.375rem',
                        border: '1.5px solid var(--color-border, #e2e8f0)',
                        fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Étape 2 : Modalités ── */}
          {step === 2 && (
            <>
              <h2 className="heading-3" style={{ margin: 0 }}>Comment se déroulera la session ?</h2>

              {/* Durée */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8 }}>Durée</label>
                <div className="u-d--flex flex-wrap u-gap--s">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { set('duration_minutes', d); set('slots', defaultSlots(d)); }}
                      style={{
                        padding: '8px 20px', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600,
                        border: `2px solid ${form.duration_minutes === d ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)'}`,
                        background: form.duration_minutes === d ? 'var(--color-primary, #2563eb)' : 'transparent',
                        color: form.duration_minutes === d ? '#fff' : 'inherit',
                        transition: 'all 0.15s',
                      }}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8 }}>Format</label>
                <div className="u-d--flex u-flex-column u-gap--xs">
                  {FORMATS.map(({ value, label, icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('format', value)}
                      style={{
                        padding: '10px 14px', borderRadius: '0.5rem', textAlign: 'left', cursor: 'pointer',
                        border: `2px solid ${form.format === value ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)'}`,
                        background: form.format === value ? 'var(--color-primary-light, #eff6ff)' : 'transparent',
                        transition: 'all 0.15s', display: 'flex', gap: '12px', alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{icon}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tarif */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
                  Tarif : <strong>{form.token_cost} T4G</strong>
                  <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)', marginLeft: 8, fontSize: 12 }}>
                    (1 T4G ≈ 15 min d&apos;expertise)
                  </span>
                </label>
                <input
                  type="range" min={0} max={200} step={5}
                  value={form.token_cost}
                  onChange={(e) => set('token_cost', Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div className="u-d--flex u-justify-content-between" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  <span>Gratuit</span><span>200 T4G</span>
                </div>
              </div>

              {/* Disponibilités */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8 }}>
                  Disponibilités
                </label>
                <div className="u-d--flex u-flex-column u-gap--xs" style={{ marginBottom: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={form.on_demand}
                      onChange={(e) => set('on_demand', e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    Sur demande uniquement (pas de créneaux fixes)
                  </label>
                </div>

                {!form.on_demand && (
                  <div className="u-d--flex u-flex-column u-gap--xs">
                    {form.slots.map((slot, i) => (
                      <div key={i} className="u-d--flex u-align-items-center u-gap--s">
                        <input
                          type="datetime-local"
                          value={slot.date.slice(0, 16)}
                          onChange={(e) => {
                            const updated = [...form.slots];
                            updated[i] = { ...updated[i], date: new Date(e.target.value).toISOString() };
                            set('slots', updated);
                          }}
                          style={{
                            flex: 1, padding: '6px 10px', borderRadius: '0.375rem',
                            border: '1.5px solid var(--color-border, #e2e8f0)', fontSize: 13,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => set('slots', form.slots.filter((_, j) => j !== i))}
                          style={{ color: 'var(--color-error, #d32f2f)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}
                          aria-label="Supprimer ce créneau"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      label="+ Ajouter un créneau"
                      onClick={() => set('slots', [...form.slots, { date: new Date().toISOString(), duration_minutes: form.duration_minutes }])}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Étape 3 : Confirmation ── */}
          {step === 3 && (
            <>
              <h2 className="heading-3" style={{ margin: 0 }}>Récapitulatif</h2>

              <div className="u-d--flex u-flex-column u-gap--s" style={{ background: 'var(--color-surface-secondary, #f8fafc)', borderRadius: '0.5rem', padding: '1rem' }}>
                <Row label="Thème"       value={form.topic_name || form.topic_slug} />
                <Row label="Niveau ciblé" value={{ beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' }[form.target_level]} />
                {form.description && <Row label="Description" value={form.description} />}
                <Row label="Durée"       value={`${form.duration_minutes} minutes`} />
                <Row label="Format"      value={{ video: 'Visio 📹', text: 'Chat 💬', async: 'Asynchrone 📼' }[form.format]} />
                <Row label="Tarif"       value={`${form.token_cost} T4G`} highlight />
                <Row
                  label="Disponibilités"
                  value={form.on_demand
                    ? 'Sur demande'
                    : `${form.slots.length} créneau${form.slots.length > 1 ? 'x' : ''}`}
                />
              </div>

              {error && (
                <p style={{ color: 'var(--color-error, #d32f2f)', margin: 0, fontSize: 14 }}>{error}</p>
              )}

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" id="commit" required style={{ marginTop: 2 }} />
                <span>Je m&apos;engage à honorer cette session ou à prévenir l&apos;apprenant en cas d&apos;empêchement.</span>
              </label>
            </>
          )}

          {/* ── Navigation ── */}
          <div className="u-d--flex u-gap--s" style={{ marginTop: 8 }}>
            {step > 1 && (
              <Button variant="secondary" label="Retour" onClick={() => setStep((s) => (s - 1) as Step)} />
            )}
            {step < 3 ? (
              <Button
                variant="primary"
                className="flex-1"
                disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
                label="Continuer"
                onClick={() => setStep((s) => (s + 1) as Step)}
              />
            ) : (
              <Button
                variant="primary"
                className="flex-1"
                label="Publier ma session"
                onClick={handleSubmit}
              />
            )}
          </div>
        </div>
      </ConnectedLayout>
    </>
  );
};

// Petite ligne de récap
const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="u-d--flex u-justify-content-between u-align-items-center" style={{ gap: 8 }}>
    <span style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: highlight ? 700 : 500, color: highlight ? 'var(--app-token-color, #f59e0b)' : 'inherit', textAlign: 'right' }}>
      {value}
    </span>
  </div>
);

export default Page;

Page.auth = true;
Page.role = ['alumni', 'mentor', 'service_provider'];
