import Head from 'next/head';
import Script from 'next/script';
import {
  LandingNavbar,
  LandingHero,
  LandingHowItWorks,
  LandingFeatures,
  LandingCommunity,
  LandingTestimonials,
  LandingPartners,
  LandingFooter,
} from '../components/landing';

/**
 * Landing Page - Token for Good
 * Structure UX refactorée : composants Tailwind, sans dépendances Webflow
 */
export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Token for Good - Valorise les échanges dans la communauté des Grandes Ecoles</title>
        <meta
          name="description"
          content="Token for Good est la meilleure plateforme collaborative Web3 qui distribue des tokens au sein d'une communauté de Grande Ecole. Elle dynamise et valorise les contributions positives des communautés alumni et étudiantes."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="EOti6n45NqOvNOWo7BM0Y0KjG8q68du38folU10-700" />

        {/* Canonical et hreflang */}
        <link rel="canonical" href="https://token-for-good.com/" />
        <link rel="alternate" hrefLang="fr" href="https://token-for-good.com/" />
        <link rel="alternate" hrefLang="en" href="https://token-for-good.com/en/" />
        <link rel="alternate" hrefLang="x-default" href="https://token-for-good.com/" />

        {/* Open Graph */}
        <meta property="og:title" content="Token for Good - Valorise les échanges dans la communauté des Grandes Ecoles" />
        <meta property="og:description" content="Token for Good est la meilleure plateforme collaborative Web3 qui distribue des tokens au sein d'une communauté de Grande Ecole. Elle dynamise et valorise les contributions positives des communautés alumni et étudiantes." />
        <meta property="og:image" content="https://token-for-good.com/landing/images/64497bb83dee18517f47a10c_T4G.webp" />
        <meta property="og:url" content="https://token-for-good.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_FR" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Token for Good - Valorise les échanges dans la communauté des Grandes Ecoles" />
        <meta name="twitter:description" content="Token for Good est la meilleure plateforme collaborative Web3 qui distribue des tokens au sein d'une communauté de Grande Ecole." />
        <meta name="twitter:image" content="https://token-for-good.com/landing/images/64497bb83dee18517f47a10c_T4G.webp" />
        <meta name="twitter:site" content="@TokenforGood" />
      </Head>

      {/* Scripts externes - Crisp Chat */}
      <Script
        id="crisp-chat"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="3fe7da9b-6bef-4bb0-9505-67b6674e09ca";
            (function(){
              d=document;
              s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `,
        }}
      />

      {/* Scripts externes - Sendinblue */}
      <Script
        id="sendinblue"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              window.sib = {
                equeue: [],
                client_key: "0cpm3jp4xjx53yc84akkmke4"
              };
              window.sendinblue = {};
              for (var j = ['track', 'identify', 'trackLink', 'page'], i = 0; i < j.length; i++) {
                (function(k) {
                  window.sendinblue[k] = function() {
                    var arg = Array.prototype.slice.call(arguments);
                    (window.sib[k] || function() {
                      var t = {};
                      t[k] = arg;
                      window.sib.equeue.push(t);
                    })(arg[0], arg[1], arg[2]);
                  };
                })(j[i]);
              }
              var n = document.createElement("script"),
                  i = document.getElementsByTagName("script")[0];
              n.type = "text/javascript";
              n.id = "sendinblue-js";
              n.async = true;
              n.src = "https://sibautomation.com/sa.js?key=" + window.sib.client_key;
              i.parentNode.insertBefore(n, i);
              window.sendinblue.page();
            })();
          `,
        }}
      />

      {/* Axeptio - Cookies Consent */}
      <Script
        id="axeptio"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.axeptioSettings = {
              clientId: "643d67b519fd31c444d74f38",
            };
            (function(d, s) {
              var t = d.getElementsByTagName(s)[0], e = d.createElement(s);
              e.async = true;
              e.src = "//static.axept.io/sdk.js";
              t.parentNode.insertBefore(e, t);
            })(document, "script");
          `,
        }}
      />

      {/* Correctif affichage : pictogrammes et images contraints (évite overflow full-screen) */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .landing-page .landing-icon-sm svg,
          .landing-page .landing-icon-md svg { flex-shrink: 0; width: 1.25rem !important; height: 1.25rem !important; max-width: 2.5rem; max-height: 2.5rem; }
          .landing-page .landing-icon-md svg { width: 1.5rem !important; height: 1.5rem !important; }
          .landing-page .landing-partner-img { max-width: 180px; max-height: 100px; object-fit: contain; }
          .landing-page .landing-community-img { max-width: 100%; max-height: 300px; }
        `,
      }} />
      {/* Contenu principal */}
      <div className="landing-page min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <LandingNavbar />
        <main>
          <LandingHero />
          <LandingHowItWorks />
          <LandingFeatures />
          <LandingCommunity />
          <LandingTestimonials />
          <LandingPartners />
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
