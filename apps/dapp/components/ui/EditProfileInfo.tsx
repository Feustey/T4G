import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LangType } from '../../lib/shared-types';
import useSwr from 'swr';
import { apiClient } from '../../services/apiClient';
import { resizeFile } from '../../services';

export interface EditProfileInfoProps {
  lang: LangType;
}

type TopicPillsProps = {
  topics: { slug: string; name: string }[];
  selected: string[];
  onToggle: (slug: string) => void;
};

const TopicPills: React.FC<TopicPillsProps> = ({ topics, selected, onToggle }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
    {topics.map((t) => {
      const active = selected.includes(t.slug);
      return (
        <button
          key={t.slug}
          type="button"
          onClick={() => onToggle(t.slug)}
          style={{
            padding: '5px 12px',
            borderRadius: 999,
            fontSize: 13,
            cursor: 'pointer',
            border: `2px solid ${active ? 'var(--app-button-background)' : '#94a3b8'}`,
            background: active ? 'var(--app-color-background-ternary, #f1f5f9)' : 'transparent',
            color: active ? 'var(--app-button-background)' : 'inherit',
            fontWeight: active ? 600 : 400,
          }}
        >
          {t.name}
        </button>
      );
    })}
    {topics.length === 0 && (
      <p style={{ fontSize: 13, color: 'var(--app-color-text-disabled)', margin: 0 }}>
        Chargement des thèmes...
      </p>
    )}
  </div>
);

export const EditProfileInfo: React.FC<EditProfileInfoProps> = ({ lang: _lang }) => {
  const { user, refreshSession } = useAuth();

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');

  const [isMentorActive, setIsMentorActive] = useState(false);
  const [mentorBio, setMentorBio] = useState('');
  const [mentorTopics, setMentorTopics] = useState<string[]>([]);
  const [mentorTokensPerHour, setMentorTokensPerHour] = useState<number | null>(null);
  const [learningTopics, setLearningTopics] = useState<string[]>([]);

  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { data: topics = [] } = useSwr(
    'learning-topics',
    () => apiClient.getLearningTopics(),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (!user) return;
    setFirstname(user.firstname || '');
    setLastname(user.lastname || '');
    setBio(user.bio || '');
    setAvatarPreview(user.avatar_url || '');
    setIsMentorActive(user.is_mentor_active ?? false);
    setMentorBio(user.mentor_bio ?? '');
    setMentorTopics(user.mentor_topics ?? []);
    setLearningTopics(user.learning_topics ?? []);
    setMentorTokensPerHour(user.mentor_tokens_per_hour ?? null);
  }, [user]);

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAvatarUploading(true);
    try {
      const resized = await resizeFile(file) as string;
      setAvatarPreview(resized);
      setAvatarBase64(resized);
    } catch {
      // ignore
    } finally {
      setIsAvatarUploading(false);
    }
  }, []);

  const toggleTopic = (
    slug: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await apiClient.updateUser(user.id, {
        firstname,
        lastname,
        bio: bio || undefined,
        avatar: avatarBase64 || undefined,
        is_mentor_active: isMentorActive,
        mentor_bio: mentorBio || undefined,
        mentor_topics: mentorTopics,
        learning_topics: learningTopics,
        mentor_tokens_per_hour: mentorTokensPerHour ?? undefined,
      } as any);
      await refreshSession?.();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = ((firstname[0] || '') + (lastname[0] || '')).toUpperCase() || '?';

  return (
    <form className="EditProfileInfo" onSubmit={handleSave} noValidate>

      {/* ── Avatar ─────────────────────────────────────── */}
      <section className="EditProfileInfo__section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ flexShrink: 0 }}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--app-button-background)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 28,
                }}
              >
                {initials}
              </div>
            )}
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 16 }}>
              {firstname} {lastname}
            </p>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--app-color-text-disabled)' }}>
              {user?.email}
            </p>
            <label
              style={{
                cursor: isAvatarUploading ? 'wait' : 'pointer',
                color: 'var(--app-color-text-secondary)',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {isAvatarUploading ? 'Chargement...' : 'Changer la photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isAvatarUploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </section>

      {/* ── Identité ───────────────────────────────────── */}
      <section className="EditProfileInfo__section">
        <h3 className="heading-3 EditProfileInfo__section-title">Identité</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label" htmlFor="ep-firstname">Prénom</label>
            <input
              id="ep-firstname"
              type="text"
              className="form-control"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              placeholder="John"
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label" htmlFor="ep-lastname">Nom</label>
            <input
              id="ep-lastname"
              type="text"
              className="form-control"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              placeholder="Doe"
              required
            />
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label className="form-label" htmlFor="ep-bio">Biographie</label>
          <textarea
            id="ep-bio"
            className="form-control form-control--textarea"
            rows={4}
            value={bio}
            placeholder="Parle-nous de toi en quelques mots..."
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      </section>

      {/* ── Profil Mentor ──────────────────────────────── */}
      <section className="EditProfileInfo__section" id="mentor">
        <h3 className="heading-3 EditProfileInfo__section-title">Profil Mentor</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            id="ep-mentor-active"
            className="form-checkbox"
            checked={isMentorActive}
            onChange={(e) => setIsMentorActive(e.target.checked)}
          />
          <label htmlFor="ep-mentor-active" style={{ cursor: 'pointer', fontWeight: 500 }}>
            Proposer des sessions de mentoring
          </label>
        </div>

        {isMentorActive && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="ep-mentor-bio">Bio mentor</label>
              <textarea
                id="ep-mentor-bio"
                className="form-control form-control--textarea"
                rows={3}
                value={mentorBio}
                placeholder="Décris ton expertise et ce que tu peux apporter..."
                onChange={(e) => setMentorBio(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Thèmes enseignés</label>
              <TopicPills
                topics={topics}
                selected={mentorTopics}
                onToggle={(slug) => toggleTopic(slug, mentorTopics, setMentorTopics)}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="ep-mentor-rate">
                Tarif (T4G / heure)
              </label>
              <input
                id="ep-mentor-rate"
                type="number"
                min={0}
                className="form-control"
                style={{ maxWidth: 160 }}
                value={mentorTokensPerHour ?? ''}
                placeholder="60"
                onChange={(e) =>
                  setMentorTokensPerHour(e.target.value ? parseInt(e.target.value, 10) : null)
                }
              />
              <p style={{ fontSize: 12, color: 'var(--app-color-text-disabled)', marginTop: 4 }}>
                1 T4G ≈ 15 min d&apos;expertise
              </p>
            </div>
          </>
        )}
      </section>

      {/* ── Apprentissage ──────────────────────────────── */}
      <section className="EditProfileInfo__section">
        <h3 className="heading-3 EditProfileInfo__section-title">Apprentissage</h3>
        <p style={{ fontSize: 13, color: 'var(--app-color-text-disabled)', margin: '0 0 4px' }}>
          Sur quels sujets veux-tu progresser ?
        </p>
        <TopicPills
          topics={topics}
          selected={learningTopics}
          onToggle={(slug) => toggleTopic(slug, learningTopics, setLearningTopics)}
        />
      </section>

      {/* ── Actions ────────────────────────────────────── */}
      <div className="EditProfileInfo__actions">
        {saveStatus === 'success' && (
          <p className="EditProfileInfo__feedback EditProfileInfo__feedback--success">
            Profil enregistré.
          </p>
        )}
        {saveStatus === 'error' && (
          <p className="EditProfileInfo__feedback EditProfileInfo__feedback--error error-text">
            Une erreur est survenue. Réessaie.
          </p>
        )}
        <button
          type="submit"
          className="c-button c-button--primary"
          disabled={isSaving}
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
};
