import React, { useState, useCallback, useReducer, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LangType } from '../../lib/shared-types';
import { Avatar, AddStudies, AddExperiences } from '..';
import { TextInput, Button } from '..';
import useSwr from 'swr';
import {
  setUserCV,
  setUserAvatar,
  setUserExperience,
  setUserAbout,
  getUserAvatar,
  getUserExperience,
  resizeFile,
} from '../../services';
import { apiClient } from '../../services/apiClient';

export interface EditProfileInfoProps {
  lang: LangType;
}

type ProfileState = {
  firstname: string;
  lastname: string;
  bio: string;
  avatar: string;
  program: string;
  topic: string;
  school: string;
  graduatedYear: string;
  title: string;
  company: string;
  city: string;
  country: string;
  industry: string;
  monthFrom: number | null;
  yearFrom: number | null;
  monthTo: number | null;
  yearTo: number | null;
  isCurrent: boolean;
  dateError: boolean;
  is_mentor_active: boolean;
  mentor_bio: string;
  mentor_topics: string[];
  learning_topics: string[];
  mentor_tokens_per_hour: number | null;
};

type Action =
  | { type: 'UPDATE_FIELD'; field: keyof ProfileState; value: any }
  | { type: 'RESET'; payload: Partial<ProfileState> };

function reducer(state: ProfileState, action: Action): ProfileState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const initialState: ProfileState = {
  firstname: '',
  lastname: '',
  bio: '',
  avatar: '',
  program: '',
  topic: '',
  school: '',
  graduatedYear: '',
  title: '',
  company: '',
  city: '',
  country: '',
  industry: '',
  monthFrom: null,
  yearFrom: null,
  monthTo: null,
  yearTo: null,
  isCurrent: false,
  dateError: false,
  is_mentor_active: false,
  mentor_bio: '',
  mentor_topics: [],
  learning_topics: [],
  mentor_tokens_per_hour: null,
};

export const EditProfileInfo: React.FC<EditProfileInfoProps> = ({ lang }) => {
  const { user, refreshSession } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = useCallback(
    (value: string | boolean | number, field: keyof ProfileState) => {
      dispatch({ type: 'UPDATE_FIELD', field, value });
    },
    []
  );

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [avatar, cv, experiences] = await Promise.allSettled([
          getUserAvatar(user.id),
          apiClient.getCurrentUserCV(),
          getUserExperience(),
        ]);

        const avatarValue =
          avatar.status === 'fulfilled' ? avatar.value : user.avatar_url || '';
        const cvValue = cv.status === 'fulfilled' ? cv.value : {};
        const experiencesValue =
          experiences.status === 'fulfilled' ? experiences.value : [];

        type ExpShape = { from?: string | Date; to?: string | Date; title?: string; company?: string; city?: string; country?: string; industry?: string; isCurrent?: boolean };
        const exp: ExpShape = experiencesValue?.[0] ?? {};
        const fromDate = exp.from ? new Date(exp.from) : null;
        const toDate = exp.to ? new Date(exp.to) : null;

        dispatch({
          type: 'RESET',
          payload: {
            firstname: user.firstname || user.first_name || '',
            lastname: user.lastname || user.last_name || '',
            bio: user.bio || '',
            avatar: avatarValue || '',
            program: cvValue?.program || user.program || '',
            topic: cvValue?.topic || '',
            school: cvValue?.school || '',
            graduatedYear:
              cvValue?.graduatedYear ||
              (user.graduated_year ? String(user.graduated_year) : ''),
            title: exp?.title || '',
            company: exp?.company || '',
            city: exp?.city || '',
            country: exp?.country || '',
            industry: exp?.industry || '',
            monthFrom: fromDate ? fromDate.getMonth() + 1 : null,
            yearFrom: fromDate ? fromDate.getFullYear() : null,
            monthTo: toDate ? toDate.getMonth() + 1 : null,
            yearTo: toDate ? toDate.getFullYear() : null,
            isCurrent: exp?.isCurrent || false,
            is_mentor_active: user.is_mentor_active ?? false,
            mentor_bio: user.mentor_bio ?? '',
            mentor_topics: user.mentor_topics ?? [],
            learning_topics: user.learning_topics ?? [],
            mentor_tokens_per_hour: user.mentor_tokens_per_hour ?? null,
          },
        });
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (!user) return;
      setIsAvatarLoading(true);
      try {
        const resized = await resizeFile(file);
        dispatch({ type: 'UPDATE_FIELD', field: 'avatar', value: resized });
        await setUserAvatar(resized, user.id);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      } finally {
        setIsAvatarLoading(false);
      }
    },
    [user]
  );

  const userRole = user?.role?.toLowerCase();
  const isAlumni =
    userRole === 'alumni' || userRole === 'mentor' || userRole === 'service_provider';

  const { data: learningTopics = [] } = useSwr(
    'learning-topics',
    () => apiClient.getLearningTopics(),
    { revalidateOnFocus: false }
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const promises: Promise<any>[] = [
        apiClient.updateUser(user.id, {
          firstname: state.firstname,
          lastname: state.lastname,
          bio: state.bio,
          is_mentor_active: state.is_mentor_active,
          mentor_bio: state.mentor_bio || undefined,
          mentor_topics: state.mentor_topics,
          learning_topics: state.learning_topics,
          mentor_tokens_per_hour: state.mentor_tokens_per_hour ?? undefined,
        } as any),
        setUserCV({
          program: state.program,
          topic: state.topic,
          school: state.school,
          graduatedYear: state.graduatedYear,
        }),
        setUserAbout(state.bio),
      ];

      if (isAlumni && state.title && state.company) {
        const from =
          state.yearFrom && state.monthFrom
            ? new Date(state.yearFrom, state.monthFrom - 1, 1)
            : null;
        const to =
          !state.isCurrent && state.yearTo && state.monthTo
            ? new Date(state.yearTo, state.monthTo - 1, 1)
            : undefined;

        promises.push(
          setUserExperience({
            title: state.title,
            company: state.company,
            city: state.city,
            country: state.country as any,
            industry: state.industry as any,
            from,
            to,
            isCurrent: state.isCurrent,
          })
        );
      }

      await Promise.all(promises);
      await refreshSession?.();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="EditProfileInfo EditProfileInfo--loading">
        <p>{lang.utils.loading}</p>
      </div>
    );
  }

  return (
    <form className="EditProfileInfo" onSubmit={handleSave} noValidate>
      {/* Section Avatar */}
      <section className="EditProfileInfo__section">
        <h3 className="heading-3 EditProfileInfo__section-title">
          {lang.page.profile.sections.avatar.title}
        </h3>
        <div className="EditProfileInfo__avatar-wrapper">
          <Avatar
            id="profile-avatar"
            avatar={state.avatar || undefined}
            firstname={state.firstname || user?.firstname || ''}
            lastname={state.lastname || user?.lastname || ''}
            size="lg"
            isEditable={true}
            isLoading={isAvatarLoading}
            handleFileUpload={handleAvatarUpload}
          />
        </div>
      </section>

      {/* Section Informations personnelles */}
      <section className="EditProfileInfo__section">
        <h3 className="heading-3 EditProfileInfo__section-title">
          {lang.page.profile.sections.personalInfo.title}
        </h3>
        <div className="u-d--flex u-flex-wrap u-gap--6">
          <TextInput
            id="firstname"
            langFile={lang}
            labelText={lang.page.profile.sections.personalInfo.firstname}
            isRequired={true}
            labelClassName="form-label"
            containerClassName="u-flex--1"
            value={state.firstname}
            placeholder="John"
            handleChange={(v) => handleChange(v, 'firstname')}
          />
          <TextInput
            id="lastname"
            langFile={lang}
            labelText={lang.page.profile.sections.personalInfo.lastname}
            isRequired={true}
            labelClassName="form-label"
            containerClassName="u-flex--1"
            value={state.lastname}
            placeholder="Doe"
            handleChange={(v) => handleChange(v, 'lastname')}
          />
        </div>

        <div className="EditProfileInfo__bio u-margin-top--s">
          <label className="form-label" htmlFor="bio">
            {lang.page.profile.sections.personalInfo.bio}
          </label>
          <textarea
            id="bio"
            className="form-control EditProfileInfo__textarea"
            rows={4}
            value={state.bio}
            placeholder={lang.page.profile.sections.personalInfo.bioPlaceholder}
            onChange={(e) => handleChange(e.target.value, 'bio')}
          />
        </div>
      </section>

      {/* Section Formation */}
      <section className="EditProfileInfo__section">
        <h3 className="heading-3 EditProfileInfo__section-title">
          {lang.page.profile.sections.education.title}
        </h3>
        <AddStudies
          lang={lang}
          program={state.program}
          topic={state.topic}
          school={state.school}
          graduatedYear={state.graduatedYear}
          user={user as any}
          handleChange={(value, id) =>
            handleChange(value as any, id as keyof ProfileState)
          }
        />
      </section>

      {/* Section Expérience professionnelle (alumni/mentor uniquement) */}
      {isAlumni && (
        <section className="EditProfileInfo__section">
          <h3 className="heading-3 EditProfileInfo__section-title">
            {lang.page.profile.sections.experience.title}
          </h3>
          <AddExperiences
            lang={lang}
            variant="onboarding"
            title={state.title}
            company={state.company}
            city={state.city}
            country={state.country as any}
            industry={state.industry as any}
            monthFrom={state.monthFrom}
            yearFrom={state.yearFrom}
            monthTo={state.monthTo}
            yearTo={state.yearTo}
            isCurrent={state.isCurrent}
            handleChange={(value, id) =>
              handleChange(value as any, id as keyof ProfileState)
            }
          />
        </section>
      )}

      {/* Section Profil Mentor */}
      <section className="EditProfileInfo__section" id="mentor">
        <h3 className="heading-3 EditProfileInfo__section-title">
          Profil Mentor
        </h3>
        <div className="u-d--flex u-align-items-center u-gap--s" style={{ marginBottom: 16 }}>
          <input
            type="checkbox"
            id="is_mentor_active"
            checked={state.is_mentor_active}
            onChange={(e) => handleChange(e.target.checked, 'is_mentor_active')}
          />
          <label htmlFor="is_mentor_active" style={{ cursor: 'pointer', fontWeight: 500 }}>
            Activer mon profil mentor (proposer des sessions)
          </label>
        </div>
        {state.is_mentor_active && (
          <>
            <div className="EditProfileInfo__bio u-margin-top--s">
              <label className="form-label" htmlFor="mentor_bio">
                Bio mentor
              </label>
              <textarea
                id="mentor_bio"
                className="form-control EditProfileInfo__textarea"
                rows={3}
                value={state.mentor_bio}
                placeholder="Présente ton expertise et ce que tu peux apporter en mentoring..."
                onChange={(e) => handleChange(e.target.value, 'mentor_bio')}
              />
            </div>
            <div className="u-margin-top--s">
              <label className="form-label">Thèmes enseignés</label>
              <div className="u-d--flex u-flex-wrap u-gap--xs" style={{ gap: 8, marginTop: 8 }}>
                {learningTopics.map((t: { slug: string; name: string }) => (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => {
                      const next = state.mentor_topics.includes(t.slug)
                        ? state.mentor_topics.filter((s) => s !== t.slug)
                        : [...state.mentor_topics, t.slug];
                      dispatch({ type: 'UPDATE_FIELD', field: 'mentor_topics', value: next });
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: `2px solid ${state.mentor_topics.includes(t.slug) ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)'}`,
                      background: state.mentor_topics.includes(t.slug) ? 'var(--color-primary-light, #eff6ff)' : 'transparent',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="u-margin-top--s">
              <label className="form-label" htmlFor="mentor_tokens_per_hour">
                Tarif par défaut (T4G/heure)
              </label>
              <input
                id="mentor_tokens_per_hour"
                type="number"
                min={0}
                className="form-control"
                value={state.mentor_tokens_per_hour ?? ''}
                placeholder="60"
                onChange={(e) => {
                  const v = e.target.value ? parseInt(e.target.value, 10) : null;
                  handleChange(v, 'mentor_tokens_per_hour');
                }}
              />
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                1 T4G ≈ 15 min d&apos;expertise
              </p>
            </div>
          </>
        )}
        <div className="u-margin-top--m">
          <label className="form-label">Thèmes d&apos;apprentissage</label>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Sur quels sujets veux-tu progresser ?
          </p>
          <div className="u-d--flex u-flex-wrap u-gap--xs" style={{ gap: 8 }}>
            {learningTopics.map((t: { slug: string; name: string }) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => {
                  const next = state.learning_topics.includes(t.slug)
                    ? state.learning_topics.filter((s) => s !== t.slug)
                    : [...state.learning_topics, t.slug];
                  dispatch({ type: 'UPDATE_FIELD', field: 'learning_topics', value: next });
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: `2px solid ${state.learning_topics.includes(t.slug) ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)'}`,
                  background: state.learning_topics.includes(t.slug) ? 'var(--color-primary-light, #eff6ff)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="EditProfileInfo__actions">
        {saveStatus === 'success' && (
          <p className="EditProfileInfo__feedback EditProfileInfo__feedback--success">
            {lang.page.profile.saveSuccess}
          </p>
        )}
        {saveStatus === 'error' && (
          <p className="EditProfileInfo__feedback EditProfileInfo__feedback--error error-text">
            {lang.page.profile.saveError}
          </p>
        )}
        <Button
          type="submit"
          label={isSaving ? lang.page.profile.savingButton : lang.page.profile.saveButton}
          variant="primary"
          isLoading={isSaving}
          disabled={isSaving}
          lang={lang}
        />
      </div>
    </form>
  );
};
