import React, { useState, useCallback } from 'react';
import { EditProfileInfo } from '../components/ui';
import { Components } from '../lib/types';
import Head from 'next/head';
import ConnectedLayout from '../layouts/ConnectedLayout';
import { useIndexing, useNotify } from '../hooks';
import { AuthPageType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Breadcrumb } from '../components';
import { useAppContext } from '../contexts/AppContext';
import { DeleteUser } from '../components/ui/DeleteUser';
import { RightPanel, AppModal } from '../lib/ui-layouts';
import useSwr from 'swr';
import { apiClient, LearningTopic } from '../services/apiClient';

// ── Composant Section Profil Mentor ─────────────────────────────────────────

const MentorProfileSection: React.FC = () => {
  const { user, reloadUser } = useAuth();
  const notify = useNotify();

  const { data: topics = [] } = useSwr<LearningTopic[]>(
    '/api/learning/topics',
    () => apiClient.getLearningTopics(),
    { revalidateOnFocus: false }
  );

  const [isActive, setIsActive] = useState(user?.is_mentor_active ?? false);
  const [mentorTopics, setMentorTopics] = useState<string[]>(user?.mentor_topics ?? []);
  const [learningTopics, setLearningTopics] = useState<string[]>(user?.learning_topics ?? []);
  const [mentorBio, setMentorBio] = useState(user?.mentor_bio ?? '');
  const [tokensPerHour, setTokensPerHour] = useState(user?.mentor_tokens_per_hour ?? 60);
  const [saving, setSaving] = useState(false);

  const toggleTopic = useCallback((list: string[], slug: string): string[] =>
    list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug],
  []);

  async function handleSave() {
    setSaving(true);
    try {
      await apiClient.updateMentorProfile({
        is_mentor_active: isActive,
        mentor_topics: mentorTopics,
        learning_topics: learningTopics,
        mentor_bio: mentorBio.trim() || undefined,
        mentor_tokens_per_hour: tokensPerHour,
      });
      await reloadUser();
      notify.success('Profil mentor mis à jour.');
    } catch {
      notify.error('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  const topicsByCategory = topics.reduce<Record<string, LearningTopic[]>>((acc, t) => {
    const cat = t.category?.name ?? 'Autres';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  return (
    <div className="o-card u-d--flex u-flex-column u-gap--m" style={{ marginTop: '2rem' }}>
      <div className="u-d--flex u-align-items-center u-justify-content-between">
        <h2 className="heading-3" style={{ margin: 0 }}>Profil mentor</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            {isActive ? 'Actif' : 'Inactif'}
          </span>
          <div
            onClick={() => setIsActive((v) => !v)}
            style={{
              width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
              background: isActive ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #cbd5e1)',
              position: 'relative', transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 2, left: isActive ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
            }} />
          </div>
        </label>
      </div>

      {isActive && (
        <>
          {/* Bio mentor */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
              Bio mentor
              <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)', marginLeft: 6, fontSize: 12 }}>(optionnel)</span>
            </label>
            <textarea
              rows={3}
              value={mentorBio}
              onChange={(e) => setMentorBio(e.target.value)}
              placeholder="Décris ton parcours, ton approche pédagogique, ce que tu peux apporter…"
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '0.375rem',
                border: '1.5px solid var(--color-border, #e2e8f0)',
                fontSize: 14, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Tarif par défaut */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
              Tarif par défaut : <strong>{tokensPerHour} T4G / heure</strong>
            </label>
            <input
              type="range" min={0} max={200} step={5}
              value={tokensPerHour}
              onChange={(e) => setTokensPerHour(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div className="u-d--flex u-justify-content-between" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              <span>Gratuit</span><span>200 T4G</span>
            </div>
          </div>

          {/* Thèmes que j'enseigne */}
          {topics.length > 0 && (
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8 }}>
                Thèmes que j&apos;enseigne
              </label>
              <TopicMultiSelect
                topics={topicsByCategory}
                selected={mentorTopics}
                onToggle={(slug) => setMentorTopics((prev) => toggleTopic(prev, slug))}
              />
            </div>
          )}

          {/* Thèmes que j'apprends */}
          {topics.length > 0 && (
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8 }}>
                Thèmes que j&apos;apprends
              </label>
              <TopicMultiSelect
                topics={topicsByCategory}
                selected={learningTopics}
                onToggle={(slug) => setLearningTopics((prev) => toggleTopic(prev, slug))}
              />
            </div>
          )}
        </>
      )}

      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        style={{
          alignSelf: 'flex-start', padding: '10px 24px', borderRadius: '0.5rem',
          background: 'var(--color-primary, #2563eb)', color: '#fff',
          border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          fontWeight: 600, fontSize: 14, opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? 'Sauvegarde…' : 'Enregistrer'}
      </button>
    </div>
  );
};

const TopicMultiSelect: React.FC<{
  topics: Record<string, LearningTopic[]>;
  selected: string[];
  onToggle: (slug: string) => void;
}> = ({ topics, selected, onToggle }) => (
  <div className="u-d--flex u-flex-column u-gap--s">
    {Object.entries(topics).map(([catName, catTopics]) => (
      <div key={catName}>
        <p style={{ fontWeight: 600, fontSize: '0.8rem', margin: '0 0 6px', color: 'var(--color-text-secondary, #64748b)' }}>
          {catName}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {catTopics.map((t) => {
            const active = selected.includes(t.slug);
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => onToggle(t.slug)}
                style={{
                  padding: '5px 12px', borderRadius: '999px', fontSize: 12, cursor: 'pointer',
                  border: `1.5px solid ${active ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)'}`,
                  background: active ? 'var(--color-primary, #2563eb)' : 'transparent',
                  color: active ? '#fff' : 'inherit',
                  fontWeight: active ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const Page: React.FC<Components.Profile.Page.Props> & AuthPageType = ({
  lang,
}: Components.Profile.Page.Props) => {
  const { user } = useAuth();
  const { setModal } = useAppContext();

  return (
    <>
      <Head>
        <title>{lang.page.profile.head.title}</title>
        {useIndexing(false)}
      </Head>
      <ConnectedLayout user={user} lang={lang}>
        <Breadcrumb
          links={[
            {
              text: lang.components.breadcrumb.dashboard.label,
              link: '/dashboard',
              parent: true,
            },
            { text: lang.components.breadcrumb.profile.label },
          ]}
        />
        <div className="Profile">
          <main className="Profile__main">
            <EditProfileInfo lang={lang} />
            <MentorProfileSection />
          </main>
          <aside className="Profile__aside">
            <p
              className="Profile__delete-account"
              onClick={async (e) => {
                e.preventDefault();
                setModal({ component: <DeleteUser /> });
              }}
            >
              <span className="u-text--bold">Delete</span> your account
            </p>
          </aside>
        </div>
        <RightPanel />
        <AppModal />
      </ConnectedLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['alumni', 'mentee', 'mentor', 'service_provider'];

export const getServerSideProps = () => ({ props: {} });

