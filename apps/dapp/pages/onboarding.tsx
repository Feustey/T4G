import React, { useReducer, useMemo, useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
// NextAuth supprimé - utilisation d'AuthContext JWT
// import { identitiesDAO, dbConnect } from '@t4g/service/data';
import { identitiesDAO, dbConnect } from '../lib/stubs/data-stubs';
import { useAppDispatch, useIndexing } from '../hooks';
import {
  AuthPageType,
  LangType,
  LocaleType,
  UserCVType,
  UserExperienceType,
  UserType,
} from '../types';
import OnboardingLayout from '../layouts/OnboardingLayout';
import {
  Avatar,
  Button,
  AddExperiences,
  Spinner,
  AddStudies,
  Message,
  Fixed,
} from '../components';
import {
  setUserAvatar,
  setUserCV,
  setUserExperience,
  resizeFile,
  activateUserWallet,
  getUserAvatarServerSide,
  updateProposedServices,
} from '../services';
import {
  addUserNotificationsState,
  setUserNotificationsState,
} from '../store/slices';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { alumniServices } from '../data';
import { getCVServerSide } from '../services/user';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

export interface IOnboarding {
  lang: LangType;
  baseAvatar: string;
  baseCV: UserCVType;
  baseExperiences: UserExperienceType[];
  user: UserType;
}

// 1. Définir les types pour l'état et les actions du reducer
type State = Omit<UserCVType, 'experiences'> & UserExperienceType & {
  avatar: string;
  dateError: boolean;
};

type Action = { type: 'UPDATE_FIELD'; field: keyof State; value: any };

// 2. Créer le reducer pour gérer les mises à jour de l'état
function formReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    default:
      throw new Error();
  }
}

export function Onboarding({
  lang,
  baseAvatar,
  baseCV,
  user: userProp,
  baseExperiences,
}: IOnboarding & AuthPageType) {
  const router = useRouter();
  const locale = router.locale as LocaleType;
  const dispatchRedux = useAppDispatch();
  
  // Utiliser l'utilisateur depuis AuthContext (priorité) ou props (fallback)
  const { user: authUser } = useAuth();
  let user = authUser || userProp;
  
  // Conversion des rôles backend vers format frontend
  if (user && user.role) {
    const roleMap = {
      'mentee': 'STUDENT',
      'mentor': 'ALUMNI',
      'admin': 'ADMIN',
    };
    user = {
      ...user,
      role: roleMap[user.role.toLowerCase()] || user.role.toUpperCase(),
    } as any;
  }
  
  const baseExperience = baseExperiences?.[0] || {};

  // 3. Initialiser l'état avec useReducer
  const initialState: State = {
    avatar: baseAvatar || null,
    program: baseCV?.program || null,
    topic: baseCV?.topic || null,
    school: baseCV?.school || null, // Correction du bug
    graduatedYear: baseCV?.graduatedYear || null,
    title: baseExperience?.title || null,
    company: baseExperience?.company || null,
    city: baseExperience?.city || null,
    country: baseExperience?.country || null,
    industry: baseExperience?.industry || null,
    from: baseExperience?.from ? new Date(baseExperience.from) : null,
    to: baseExperience?.to ? new Date(baseExperience.to) : null,
    isCurrent: baseExperience?.isCurrent || false,
    dateError: false,
  };

  const [state, dispatch] = useReducer(formReducer, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [walletStep, setWalletStep] = useState<'idle' | 'creating' | 'done'>('idle');
  const noIndex = useIndexing(false);

  const totalSteps = user?.role === 'ALUMNI' ? 3 : 2;

  // 4. Simplifier la fonction handleChange
  const handleChange = (value: string | boolean | number, id: keyof State) => {
    dispatch({ type: 'UPDATE_FIELD', field: id, value });
  };

  // 5. Logique de validation centralisée et lisible
  const isStudentFormValid = useMemo(() => {
    return !!state.program && !!state.topic && !!state.graduatedYear && !!state.school;
  }, [state.program, state.topic, state.graduatedYear, state.school]);

  const isAlumniFormValid = useMemo(() => {
    const experienceComplete =
      !!state.title &&
      !!state.company &&
      !!state.city &&
      !!state.country &&
      !!state.industry &&
      state.from instanceof Date &&
      (state.isCurrent || state.to instanceof Date);
    return isStudentFormValid && experienceComplete && !state.dateError;
  }, [isStudentFormValid, state]);

  const isFormValid = user?.role === 'STUDENT' ? isStudentFormValid : isAlumniFormValid;

  async function finishUserOnboarding(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    if (!isFormValid) return;
    if (!user || !user.id) return;

    setIsSubmitting(true);
    try {
      await Promise.all([
        setUserCV({
          program: state.program,
          topic: state.topic,
          graduatedYear: state.graduatedYear,
          school: state.school,
        }),
        setUserAvatar(state.avatar, user.id),
        apiClient.updateUser(user.id, { is_onboarded: true }),
        ...(user.role === 'ALUMNI'
          ? [
              setUserExperience({
                title: state.title,
                company: state.company,
                city: state.city,
                country: state.country,
                industry: state.industry,
                from: state.from,
                to: state.to,
                isCurrent: state.isCurrent,
              }),
              updateProposedServices([
                ...alumniServices.studentMentor.map((service) => service.name),
              ]),
            ]
          : []),
      ]);

      setWalletStep('creating');
      const walletStatus = await activateUserWallet();

      if (walletStatus === 'SUCCESS') {
        setWalletStep('done');
        dispatchRedux(setUserNotificationsState(null));
        setTimeout(() => {
          router.push('/dashboard', '/dashboard', { locale: locale });
        }, 1800);
      } else {
        throw new Error(lang.userNotifications.errors.walletCreation);
      }
    } catch (error) {
      console.error('Onboarding failed:', error);
      setWalletStep('idle');
      dispatchRedux(
        addUserNotificationsState({
          content: error.message || 'An unknown error occurred.',
          status: 'error',
          id: uuidv4(),
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!user || !user.id) {
      router.push(`/${locale}/login`);
    }
  }, [user, locale, router]);

  if (!user || !user.id) {
    return (
      <>
        <Head>
          <title>{lang.page.onboarding.head.title}</title>
          {noIndex}
        </Head>
        <Spinner lang={lang} spinnerText={lang?.utils?.redirecting || 'Redirection...'} />
      </>
    );
  }

  if (walletStep === 'creating' || walletStep === 'done') {
    return (
      <>
        <Head>
          <title>{lang.page.onboarding.head.title}</title>
          {noIndex}
        </Head>
        <OnboardingLayout lang={lang}>
          <div className="e-container e-container--onboarding u-d--flex u-flex-column u-align-items-center u-gap--6" style={{ minHeight: '60vh', justifyContent: 'center' }}>
            {walletStep === 'creating' ? (
              <>
                <Spinner lang={lang} spinnerText="" />
                <h2 className="u-text--center heading-3">Création de votre wallet T4G...</h2>
                <p className="u-text--center" style={{ color: 'var(--color-text-secondary, #666)', maxWidth: 360 }}>
                  Votre portefeuille Lightning Network est en cours de configuration. Cela ne prend que quelques secondes.
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 64, textAlign: 'center' }}>🎉</div>
                <h2 className="u-text--center heading-3">Votre wallet est prêt !</h2>
                <p className="u-text--center" style={{ color: 'var(--color-text-secondary, #666)', maxWidth: 360 }}>
                  Bienvenue dans la communauté Token4Good. Vous allez être redirigé vers votre tableau de bord.
                </p>
                <Spinner lang={lang} spinnerText="Redirection..." />
              </>
            )}
          </div>
        </OnboardingLayout>
      </>
    );
  }

  if (isSubmitting) {
    return (
      <>
        <Head><title>{lang.page.onboarding.head.title}</title>{noIndex}</Head>
        <Spinner lang={lang} spinnerText={lang.utils.connecting} />
      </>
    );
  }

  const stepTitles = user.role === 'ALUMNI'
    ? ['Photo', lang.page.onboarding.main.studies.title, lang.page.onboarding.main.experience.title]
    : ['Photo', lang.page.onboarding.main.studies.title];

  const isLastStep = currentStep === totalSteps;

  return (
    <>
      <Head>
        <title>{lang.page.onboarding.head.title}</title>
        {noIndex}
      </Head>

      <OnboardingLayout lang={lang}>
        <div className="e-container e-container--onboarding">
          <h1 className="u-text--center">{lang.page.onboarding.main.title}</h1>

          {/* Indicateur de progression */}
          <div className="u-d--flex u-align-items-center u-justify-content-center u-gap--s" style={{ marginBottom: '1.5rem' }}>
            {stepTitles.map((title, idx) => {
              const stepNum = idx + 1;
              const isActive = stepNum === currentStep;
              const isDone = stepNum < currentStep;
              return (
                <React.Fragment key={stepNum}>
                  <div
                    className="u-d--flex u-flex-column u-align-items-center u-gap--xs"
                    style={{ cursor: isDone ? 'pointer' : 'default' }}
                    onClick={() => isDone && setCurrentStep(stepNum)}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 14,
                        background: isDone ? 'var(--color-primary, #2563eb)' : isActive ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)',
                        color: isDone || isActive ? '#fff' : 'var(--color-text-secondary, #666)',
                        border: isActive ? '2px solid var(--color-primary, #2563eb)' : '2px solid transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isDone ? '✓' : stepNum}
                    </div>
                    <span style={{ fontSize: 11, color: isActive ? 'var(--color-primary, #2563eb)' : 'var(--color-text-secondary, #999)', fontWeight: isActive ? 600 : 400 }}>
                      {title}
                    </span>
                  </div>
                  {idx < stepTitles.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: stepNum < currentStep ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)', maxWidth: 48, transition: 'background 0.3s' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <form action="" className="u-d--flex u-flex-column u-gap--6">

            {/* Étape 1 : Photo */}
            {currentStep === 1 && (
              <div className="u-d--flex u-flex-column u-align-items-center u-gap--6">
                <Message variant={'info'}>
                  <p>
                    {lang.page.onboarding.main.message.part1}{' '}
                    <span className="u-text--bold">{lang.page.onboarding.main.message.part2}</span>
                  </p>
                </Message>
                <div className="c-avatar--container">
                  <Avatar
                    id={'avatar'}
                    isEditable={true}
                    avatar={state.avatar}
                    firstname={user.firstname}
                    lastname={user.lastname}
                    isDisplayingName={true}
                    isLoading={isAvatarLoading}
                    size="md"
                    handleFileUpload={async (file: File) => {
                      setIsAvatarLoading(true);
                      dispatch({ type: 'UPDATE_FIELD', field: 'avatar', value: await resizeFile(file) });
                      setIsAvatarLoading(false);
                    }}
                  />
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary, #666)', textAlign: 'center', margin: 0 }}>
                  Optionnel — vous pourrez le modifier depuis votre profil.
                </p>
              </div>
            )}

            {/* Étape 2 : Formation */}
            {currentStep === 2 && (
              <div className="u-d--flex u-flex-column u-gap--6">
                <h2 className="u-text--center heading-3">{lang.page.onboarding.main.studies.title}</h2>
                <AddStudies
                  user={user}
                  lang={lang}
                  program={state.program}
                  school={state.school}
                  topic={state.topic}
                  graduatedYear={state.graduatedYear}
                  handleChange={handleChange}
                />
                <p aria-hidden="true">* {lang.utils.requiredFields}</p>
              </div>
            )}

            {/* Étape 3 : Expérience (ALUMNI uniquement) */}
            {currentStep === 3 && user.role === 'ALUMNI' && (
              <div className="u-d--flex u-flex-column u-gap--6">
                <h2 className="u-text--center heading-3">{lang.page.onboarding.main.experience.title}</h2>
                <AddExperiences
                  variant="onboarding"
                  lang={lang}
                  isCurrent={state.isCurrent}
                  title={state.title}
                  industry={state.industry}
                  company={state.company}
                  city={state.city}
                  monthFrom={state.from?.getMonth()}
                  yearFrom={state.from?.getFullYear()}
                  monthTo={state.to?.getMonth()}
                  yearTo={state.to?.getFullYear()}
                  country={state.country}
                  handleChange={handleChange}
                />
                <p aria-hidden="true">* {lang.utils.requiredFields}</p>
              </div>
            )}
          </form>

          <Fixed
            variant="mobile"
            className="u-d--flex u-justify-content-center u-align-items-center e-container"
          >
            <div className="u-d--flex u-flex-column u-gap--s" style={{ width: '100%', maxWidth: 400 }}>
              {isLastStep && (
                <p className="mb-0" style={{ fontSize: 12, textAlign: 'center', color: 'var(--color-text-secondary, #666)' }}>
                  En cliquant, vous acceptez{' '}
                  <a href="https://www.token-for-good.com/confidentialite" target="_blank" rel="noreferrer" className="underline">
                    la politique de confidentialité
                  </a>
                </p>
              )}
              <div className="u-d--flex u-gap--s">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    label="Retour"
                    lang={lang}
                    onClick={(e: React.MouseEvent<HTMLElement>) => {
                      e.preventDefault();
                      setCurrentStep(s => s - 1);
                    }}
                  />
                )}
                {!isLastStep ? (
                  <Button
                    type="button"
                    variant="primary"
                    disabled={currentStep === 2 && !isStudentFormValid}
                    label="Continuer"
                    lang={lang}
                    onClick={(e: React.MouseEvent<HTMLElement>) => {
                      e.preventDefault();
                      setCurrentStep(s => s + 1);
                    }}
                  />
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!isFormValid}
                    label={lang.page.onboarding.main.accessButton}
                    lang={lang}
                    onClick={async (e: React.MouseEvent<HTMLElement>) => {
                      e.preventDefault();
                      finishUserOnboarding(e);
                    }}
                  />
                )}
              </div>
            </div>
          </Fixed>
        </div>
      </OnboardingLayout>
    </>
  );
}

export default Onboarding;

Onboarding.auth = true;
Onboarding.role = ['ALUMNI', 'STUDENT'];

export const getServerSideProps: GetServerSideProps = async function (context) {
  // Authentification gérée côté client avec AuthContext JWT
  // Les props sont gérées côté client, on retourne des valeurs par défaut
  return {
    props: {
      baseAvatar: null,
      baseCV: {},
      baseExperiences: [],
      user: {
        id: '',
        email: '',
        firstname: '',
        lastname: '',
        role: 'STUDENT',
      },
    },
  };
  
  // Code commenté - authentification maintenant côté client
  // await dbConnect();
  // const user = await identitiesDAO.getById(session.user.id.toString());

  // if (user.isOnboarded || user.role === 'SERVICE_PROVIDER') {
  //   const { locale } = context;
  //   const language = locale === 'fr' ? '' : '/en';
  //   let dest: string;
  //   user.role === 'SERVICE_PROVIDER' ? (dest = 'admin') : (dest = 'dashboard');
  //   return {
  //     redirect: {
  //       permanent: false,
  //       destination: `${language}/${dest}/`,
  //     },
  //   };
  // }
  // const baseAvatar = await getUserAvatarServerSide(session.user.id);
  // const baseCV = await getCVServerSide(session.user.id);
  // const baseExperiences: UserExperienceType[] = baseCV.experiences;

  // console.log("cv", baseCV)

  // return {
  //   props: {
  //     user: session.user,
  //     baseAvatar,
  //     baseCV,
  //     baseExperiences,
  //   },
  // };
};
