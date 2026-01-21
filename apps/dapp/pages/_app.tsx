import { AppProps } from 'next/app';
import localFont from 'next/font/local';
// NextAuth supprimé - utilisation d'AuthContext JWT
// import './styles.css'; // Temporarily commented due to build error
import '../styles/styles.scss';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { AppContextProvider } from '../contexts/AppContext';
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
      <style dangerouslySetInnerHTML={{
        __html: `
          html {
            --font-family-primary: ${squadaOne.style.fontFamily};
          }
        `
      }} />
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
    </>
  );
}

function Auth({ children, lang, role }) {
  const router = useRouter();
  const locale = router.locale as LocaleType;

  // Nouveau système d'authentification JWT
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // Utiliser uniquement le nouveau système JWT
  const isLoading = authLoading;
  const isUserAuthenticated = isAuthenticated;
  const currentUser = user;

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

  // Conversion des rôles backend vers format frontend
  const roleMap = {
    'mentee': 'STUDENT',
    'mentor': 'ALUMNI',
    'admin': 'ADMIN',
  };
  
  const userRole = currentUser?.role ? (roleMap[currentUser.role.toLowerCase()] || currentUser.role.toUpperCase()) : null;
  
  console.log('🔵 Auth - userRole:', userRole, 'expected roles:', role);

  // Vérifier le rôle
  if (currentUser && userRole && role.includes(userRole)) {
    return children;
  } else {
    console.log('🔴 Auth - Rôle non autorisé, redirection vers 404');
    router.push('/404', '/404', { locale: locale });
    return null;
  }
}

export default CustomApp;
