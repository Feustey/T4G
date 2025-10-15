import React, { useReducer, useMemo, useState } from 'react';
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
  user,
  baseExperiences,
}: IOnboarding & AuthPageType) {
  const router = useRouter();
  const locale = router.locale as LocaleType;
  const dispatchRedux = useAppDispatch();

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

  const isFormValid = user.role === 'STUDENT' ? isStudentFormValid : isAlumniFormValid;

  // 6. Corriger et sécuriser la fonction de soumission
  async function finishUserOnboarding(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      // Attendre que toutes les sauvegardes soient terminées
      await Promise.all([
        setUserCV({
          program: state.program,
          topic: state.topic,
          graduatedYear: state.graduatedYear,
          school: state.school,
        }),
        setUserAvatar(state.avatar, user.id),
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

      const walletStatus = await activateUserWallet();

      if (walletStatus === 'SUCCESS') {
        dispatchRedux(setUserNotificationsState(null));
        router.push('/dashboard', '/dashboard', { locale: locale });
      } else {
        throw new Error(lang.userNotifications.errors.walletCreation);
      }
    } catch (error) {
      console.error('Onboarding failed:', error);
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

  return (
    <>
      <Head>
        <title>{lang.page.onboarding.head.title}</title>
        {useIndexing(false)}
      </Head>

      {isSubmitting ? (
        <Spinner lang={lang} spinnerText={lang.utils.connecting} />
      ) : (
        <OnboardingLayout lang={lang}>
          <div className="e-container e-container--onboarding">
            <h1 className="u-text--center">
              {lang.page.onboarding.main.title}
            </h1>
            <Message variant={'info'}>
              <p>
                {lang.page.onboarding.main.message.part1}{' '}
                <span className="u-text--bold">
                  {lang.page.onboarding.main.message.part2}
                </span>
              </p>
            </Message>

            <form action="" className="u-d--flex u-flex-column u-gap--6">
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
              <hr />
              <h2 className="u-text--center heading-3">
                {lang.page.onboarding.main.studies.title}
              </h2>
              <AddStudies
                user={user}
                lang={lang}
                program={state.program}
                school={state.school}
                topic={state.topic}
                graduatedYear={state.graduatedYear}
                handleChange={handleChange}
              />

              {user.role === 'ALUMNI' && (
                <>
                  <hr />
                  <h2 className="u-text--center heading-3">
                    {lang.page.onboarding.main.experience.title}
                  </h2>

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
                </>
              )}
              <p aria-hidden="true">* {lang.utils.requiredFields} </p>
            </form>
            <Fixed
              variant="mobile"
              className="u-d--flex u-justify-content-center u-align-items-center e-container"
            >
              <div className="flex flex-col">
              <p className='mb-0'>by clicking, you accept <a href='https://www.token-for-good.com/confidentialite' target='_blank' rel="noreferrer" className='underline'>the privacy policy</a> </p>
              {user.role === 'STUDENT' ? (
                <Button
                  type="button"
                  variant="primary"
                  disabled={
                    !(!!state.program && !!state.topic && !!state.graduatedYear)
                  }
                  label={lang.page.onboarding.main.accessButton}
                  lang={lang}
                  onClick={async (e: React.MouseEvent<HTMLElement>) => {
                    e.preventDefault();
                    finishUserOnboarding(e);
                  }}
                />
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={
                    !(
                      !!state.program &&
                      !!state.topic &&
                      !!state.graduatedYear &&
                      !!state.title &&
                      !!state.industry &&
                      !!state.company &&
                      !!state.city &&
                      !!state.country &&
                      !state.dateError &&
                      state.from?.getMonth() >= 0 &&
                      !!state.from?.getFullYear() &&
                      (!!state.isCurrent ||
                        (!!state.to?.getFullYear() && state.to?.getMonth() >= 0))
                    )
                  }
                  label={lang.page.onboarding.main.accessButton}
                  lang={lang}
                  onClick={async (e: React.MouseEvent<HTMLElement>) => {
                    e.preventDefault();
                    finishUserOnboarding(e);
                  }}
                />
              )}
                
              </div>
            </Fixed>
          </div>
        </OnboardingLayout>
      )}
    </>
  );
}

export default Onboarding;

Onboarding.auth = true;
Onboarding.role = ['ALUMNI', 'STUDENT'];

export const getServerSideProps: GetServerSideProps = async function (context) {
  // Authentification gérée côté client avec AuthContext JWT
  // Redirection vers login si pas authentifié
  return {
    redirect: {
      destination: '/login',
      permanent: false,
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
