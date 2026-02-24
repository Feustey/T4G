import React, { useState, useCallback, useReducer, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LangType } from '../../lib/shared-types';
import { Avatar, AddStudies, AddExperiences } from '..';
import { TextInput, Button } from '../shared';
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
import { apiFetcher } from '../../services/config';

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
          apiFetcher<any>('/users/me/cv'),
          getUserExperience(),
        ]);

        const avatarValue =
          avatar.status === 'fulfilled' ? avatar.value : user.avatar_url || '';
        const cvValue = cv.status === 'fulfilled' ? cv.value : {};
        const experiencesValue =
          experiences.status === 'fulfilled' ? experiences.value : [];

        const exp = experiencesValue?.[0] || {};
        const fromDate = exp?.from ? new Date(exp.from) : null;
        const toDate = exp?.to ? new Date(exp.to) : null;

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
        }),
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
