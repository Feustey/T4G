import { AppProps } from 'next/app';
import localFont from '@next/font/local';
import { getProviders, SessionProvider, useSession } from 'next-auth/react';
// import './styles.css'; // Temporarily commented due to build error
import '../styles/styles.scss';
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { AppContextProvider } from '@t4g/ui/providers';
import React from 'react';
import { useLanguage } from '../hooks';
import { Spinner, UserNotifications } from '../components';
import Script from 'next/script';
import type { NextComponentType } from 'next';
import { Provider } from 'react-redux';
import store from '../store/store';
import { AuthPageType, LocaleType, SessionType } from '../types';
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const squadaOne = localFont({
  src: '../fonts/squada_One/squadaOne.woff2',
  weight: '400',
});

type CustomAppProps = AppProps & {
  Component: NextComponentType & AuthPageType;
};

function CustomApp({
  Component,
  pageProps: { session, ...pageProps },
}: CustomAppProps) {
  const lang = useLanguage();

  return (
    <>
      <style>{`
        html {
          --font-family-primary: ${squadaOne.style.fontFamily};
        }
      `}</style>
      <SessionProvider session={session}>
        <AuthProvider>
          <Script
            strategy="afterInteractive"
            id="tag-manager"
          >{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NCQWLBN');`}</Script>
          <AppContextProvider>
            <Provider store={store}>
              <UserNotifications />
              {Component.auth ? (
                <Auth lang={lang} role={Component.role}>
                  {React.createElement(Component as React.ComponentType<any>, { lang, ...pageProps })}
                </Auth>
              ) : (
                React.createElement(Component as React.ComponentType<any>, { lang, ...pageProps })
              )}
            </Provider>
          </AppContextProvider>
        </AuthProvider>
      </SessionProvider>
    </>
  );
}

function Auth({ children, lang, role }) {
  const router = useRouter();
  const locale = router.locale as LocaleType;

  // Nouveau système d'authentification JWT
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // Ancien système NextAuth (pour compatibilité pendant la migration)
  const {
    status,
    data: session,
  }: { status: 'loading' | 'authenticated' | 'unauthenticated'; data: SessionType | null } = useSession({
    required: false,
  });

  // Utiliser le nouveau système JWT si disponible, sinon NextAuth
  const isLoading = authLoading || status === 'loading';
  const isUserAuthenticated = isAuthenticated || status === 'authenticated';
  const currentUser = user || session?.user;

  if (isLoading) {
    return <Spinner lang={lang} />;
  }

  if (!isUserAuthenticated) {
    router.push('/login', '/login', { locale: locale });
    return <Spinner lang={lang} />;
  }

  if (!role) {
    return children;
  }

  // Vérifier le rôle
  if (currentUser && role.includes(currentUser.role)) {
    return children;
  } else {
    router.push('/404', '/404', { locale: locale });
    return null;
  }
}

export default CustomApp;

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: {
      providers,
    },
  };
}
