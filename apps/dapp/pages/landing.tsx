import Head from 'next/head';
import Script from 'next/script';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Landing Page - Token for Good
 * Conversion du HTML statique en composant Next.js
 * Optimisé pour SEO, performance et i18n
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
        
        {/* Fonts et CSS */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="/landing/css/t4g-public.webflow.shared.2ea04f060.css" rel="stylesheet" type="text/css" />
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
          `
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
          `
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
          `
        }}
      />

      {/* Webflow Scripts */}
      <Script src="/landing/js/jquery-3.5.1.min.dc5e7f18c8.js" strategy="beforeInteractive" />
      <Script src="/landing/js/webflow.schunk.36b8fb49256177c8.js" strategy="lazyOnload" />
      <Script src="/landing/js/webflow.schunk.e58153e8ea5c2e95.js" strategy="lazyOnload" />
      <Script src="/landing/js/webflow.schunk.b57be75a28c416ad.js" strategy="lazyOnload" />
      <Script src="/landing/js/webflow.841c1d07.73e2161a3279ba00.js" strategy="lazyOnload" />

      {/* Styles inline pour les variables CSS et thème dark */}
      <style global>{`
        :root {
          --color-blue-50: #edefff;
          --color-blue-100: #dee2ff;
          --color-blue-200: #c4c9ff;
          --color-blue-300: #a0a6ff;
          --color-blue-400: #7e7bff;
          --color-blue-500: #6a5bf9;
          --color-blue-600: #5b3dee;
          --color-blue-700: #4f2fd3;
          --color-blue-800: #4029aa;
          --color-blue-900: #372986;
          --color-orange-50: #fff8ed;
          --color-orange-100: #ffefd4;
          --color-orange-200: #ffdba8;
          --color-orange-300: #ffc170;
          --color-orange-400: #ff9b37;
          --color-orange-500: #ff8924;
          --color-orange-600: #f06206;
          --color-orange-700: #c74907;
          --color-orange-800: #9e390e;
          --color-orange-900: #7f320f;
          --color-green-50: #effaf3;
          --color-green-100: #d9f2e1;
          --color-green-200: #b5e5c7;
          --color-green-300: #85d0a5;
          --color-green-400: #52b580;
          --color-green-500: #36ae72;
          --color-green-600: #207b50;
          --color-green-700: #1a6242;
          --color-green-800: #174e36;
          --color-green-900: #13412d;
          --color-red-50: #fef2f2;
          --color-red-100: #fee2e2;
          --color-red-200: #fecaca;
          --color-red-300: #fca5a5;
          --color-red-400: #f87171;
          --color-red-500: #ef4444;
          --color-red-600: #dc2626;
          --color-red-700: #b91c1c;
          --color-red-800: #991b1b;
          --color-red-900: #7f1d1d;
          --color-grey-50: #f5f5f6;
          --color-grey-100: #e5e6e8;
          --color-grey-200: #cecfd3;
          --color-grey-300: #acafb4;
          --color-grey-400: #83868d;
          --color-grey-500: #61646b;
          --color-grey-600: #595c61;
          --color-grey-700: #4c4e52;
          --color-grey-800: #434447;
          --color-grey-900: #262626;
          --color-white-0: transparent;
          --color-white-1000: #fff;
          --color-black-0: transparent;
          --color-black-1000: #000;
          --color-gradient-primary: linear-gradient(90deg,#7e7bff,#36ae72 50%,#ff8924);
          --color-gradient-secondary: linear-gradient(90deg,rgba(106,91,249,.2) 14.69%,#36ae72 103.51%);
          --color-gradient-terciary: linear-gradient(180deg,transparent,rgba(0,0,0,.7) 64.06%,#000);
        }

        @media (prefers-color-scheme: dark) {
          .body {
            background-color: #000;
            color: #fff;
          }
          .h1, .h2, .h3, .p.firm, .partnerlink {
            color: #a0a6ff;
          }
          .bouton {
            background-color: #a0a6ff;
          }
          .bouton:hover {
            background-color: #C4C9FF;
          }
          .textbt, .textbt.go, .user-icon {
            color: #000;
            filter: none;
          }
          .bouton.news, .bouton._404bt2, .bouton.sign {
            border-color: #a0a6ff;
          }
          .textbt.news, .textbt._404second, .textbt.sign {
            color: #a0a6ff;
          }
          .bouton.news:hover, .bouton._404bt2:hover, .bouton.sign:hover {
            border-color: #C4C9FF;
            background-color: transparent;
          }
          .bouton.news:hover .textbt.news, .bouton._404bt2:hover .textbt._404second, .bouton.sign:hover .textbt.sign {
            color: #C4C9FF;
          }
          .c-newsletter, .footer {
            background-color: #262626;
          }
          .title-circle {
            border-color: #a0a6ff;
          }
          .tab-link-tab-1, .txtlink, .paragraph-2, a, .link-block-3.return {
            color: #fff;
          }
          .link-block-3.return:hover {
            color: #acafb4;
          }
          .html-embed {
            color: #262626;
          }
          .html-embed:hover {
            color: #000;
          }
          .div-block-16 img, .image-12 {
            filter: invert(100%);
          }
          .quote {
            border-color: #fff;
          }
          .link-block-2, .image-partner {
            display: none;
          }
          .link-block-2.darkshow, .image-partner.darkshow {
            display: flex;
          }
          .form legend {
            color: #fff;
          }
          .checkbox-field {
            background-color: #372986;
          }
          .checkbox-field.is-active {
            background-color: #5b3dee;
          }
        }

        svg {
          width: 1.5rem;
          height: 1.5rem;
        }

        * {
          transition: all .2s ease-in-out;
        }

        .body {
          overflow-x: hidden;
        }

        .image-4, .filter {
          transition: none;
        }

        .collection-item {
          transition: none;
        }

        .image-partner {
          width: max-content;
        }

        .tabs-menu.w-tab-menu::-webkit-scrollbar {
          display: none;
        }

        .tabs-menu.w-tab-menu {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .tab-link-tab-1[aria-selected="true"]::after {
          content: "";
          display: block;
          height: 0.125rem;
          width: 100%;
          position: absolute;
          bottom: 0;
          left: 0;
          background: linear-gradient(90deg,#7e7bff,#36ae72 50%,#ff8924);
        }

        /* Styles pour les icônes sociales */
        .linkedin::before {
          -webkit-mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTE4LjMzNSAxOC4zMzlIMTUuNjd2LTQuMTc3YzAtLjk5Ni0uMDItMi4yNzgtMS4zOS0yLjI3OC0xLjM4OSAwLTEuNjAxIDEuMDg0LTEuNjAxIDIuMjA1djQuMjVoLTIuNjY2VjkuNzVoMi41NnYxLjE3aC4wMzVjLjM1OC0uNjc0IDEuMjI4LTEuMzg3IDIuNTI4LTEuMzg3IDIuNyAwIDMuMiAxLjc3OCAzLjIgNC4wOTF2NC43MTVoLS4wMDF6TTcuMDAzIDguNTc1YTEuNTQ2IDEuNTQ2IDAgMDEtMS41NDgtMS41NDkgMS41NDggMS41NDggMCAxMTEuNTQ3IDEuNTQ5aC4wMDF6bTEuMzM2IDkuNzY0SDUuNjY2VjkuNzVIOC4zNHY4LjU4OWgtLjAwMXpNMTkuNjcgM0g0LjMyOUMzLjU5MyAzIDMgMy41OCAzIDQuMjk3djE1LjQwNkMzIDIwLjQyIDMuNTk0IDIxIDQuMzI4IDIxaDE1LjMzOEMyMC40IDIxIDIxIDIwLjQyIDIxIDE5LjcwM1Y0LjI5N0MyMSAzLjU4IDIwLjQgMyAxOS42NjYgM2guMDA0eiIvPjwvc3ZnPg==);
          mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTE4LjMzNSAxOC4zMzlIMTUuNjd2LTQuMTc3YzAtLjk5Ni0uMDItMi4yNzgtMS4zOS0yLjI3OC0xLjM4OSAwLTEuNjAxIDEuMDg0LTEuNjAxIDIuMjA1djQuMjVoLTIuNjY2VjkuNzVoMi41NnYxLjE3aC4wMzVjLjM1OC0uNjc0IDEuMjI4LTEuMzg3IDIuNTI4LTEuMzg3IDIuNyAwIDMuMiAxLjc3OCAzLjIgNC4wOTF2NC43MTVoLS4wMDF6TTcuMDAzIDguNTc1YTEuNTQ2IDEuNTQ2IDAgMDEtMS41NDgtMS41NDkgMS41NDggMS41NDggMCAxMTEuNTQ3IDEuNTQ5aC4wMDF6bTEuMzM2IDkuNzY0SDUuNjY2VjkuNzVIOC4zNHY4LjU4OWgtLjAwMXpNMTkuNjcgM0g0LjMyOUMzLjU5MyAzIDMgMy41OCAzIDQuMjk3djE1LjQwNkMzIDIwLjQyIDMuNTk0IDIxIDQuMzI4IDIxaDE1LjMzOEMyMC40IDIxIDIxIDIwLjQyIDIxIDE5LjcwM1Y0LjI5N0MyMSAzLjU4IDIwLjQgMyAxOS42NjYgM2guMDA0eiIvPjwvc3ZnPg==);
          --icon-size: 1.5rem;
          background-color: currentColor;
          content: "";
          display: inline-flex;
          flex: 0 0 auto;
          height: var(--icon-size);
          margin-left: 0;
          margin-right: 0;
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
          vertical-align: calc(.375em - var(--icon-size)*.5);
          transition: all .2s ease-in-out;
          width: var(--icon-size);
        }

        .html-embed {
          color: #372986;
        }

        .html-embed:hover {
          color: #fff;
        }

        .instagram::before, .twitter::before, .youtube::before, .discord::before {
          --icon-size: 1.5rem;
          background-color: currentColor;
          content: "";
          display: inline-flex;
          flex: 0 0 auto;
          height: var(--icon-size);
          margin-left: 0;
          margin-right: 0;
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
          vertical-align: calc(.375em - var(--icon-size)*.5);
          transition: all .2s ease-in-out;
          width: var(--icon-size);
        }
      `}</style>

      {/* Contenu de la page */}
      <div className="body">
        {/* Navbar */}
        <section className="navbar">
          <Link href="/" className="w-inline-block w--current">
            <img 
              src="/landing/images/64497bb83dee18517f47a10c_T4G.webp" 
              loading="eager" 
              width="83" 
              alt="Token for Good logo" 
              className="logo-t4g"
            />
          </Link>
          <Link href="/login" aria-label="login" className="bouton w-inline-block">
            <img 
              src="/landing/images/6449332c3d201a8481f1de5b_svgviewer-png-output.webp" 
              loading="eager" 
              width="20" 
              height="20" 
              alt="Icône utilisateur - Se connecter" 
              className="user-icon"
            />
            <div className="textbt login">Se connecter</div>
          </Link>
        </section>

        {/* Section principale - Hero */}
        <section className="main home">
          <div className="section">
            <div className="w-layout-grid grid">
              <div className="hero-split">
                <img 
                  src="/landing/images/64493f2065a2a70b35c533b1_svgviewer-png-output(1).webp" 
                  loading="eager" 
                  alt="Illustration Token for Good - Plateforme collaborative Web3" 
                  className="image"
                />
                <img 
                  src="/landing/images/64498a85b962348a8ffd1367_spinner-animation.webp" 
                  loading="lazy" 
                  width="100" 
                  alt="Animation spinner Token for Good" 
                  className="image-4"
                />
              </div>
              
              <div className="hero-split _2">
                <h1 className="h1 h1home">Célébrer l&apos;engagement !</h1>
                
                <p className="p">
                  L&apos;ambition de Token for Good est de valoriser les actions à impacts positifs : 
                  dynamiser les échanges au sein d&apos;une communauté et donner du sens au partage !
                </p>
                <p className="p">
                  En contrepartie de sa contribution, le membre reçoit des jetons numériques 
                  (tokens… for good) et devient bénéficiaire de services et de nombreux avantages.
                </p>
                <p className="p">
                  Avec sa plate-forme collaborative, Token for Good offre donc une solution innovante 
                  d&apos;animation de communauté et s&apos;inscrit dans une « sharing economy » qui célèbre l&apos;engagement !
                </p>
                
                <div className="div-block">
                  <Link href="/login" className="bouton _2 w-inline-block">
                    <div className="textbt go">GO !</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Section "Pourquoi rejoindre" */}
            <div className="section">
              <div className="div-block-4">
                <div>
                  <div className="title-circle">
                    <div className="embed100 w-embed">
                      <svg focusable="false" aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.22766 7C6.77678 5.83481 8.25843 5 10.0001 5C12.2092 5 14.0001 6.34315 14.0001 8C14.0001 9.39944 12.7224 10.5751 10.9943 10.9066C10.4519 11.0106 10.0001 11.4477 10.0001 12M10 15H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                  </div>
                  <h2 className="h2">Pourquoi rejoindre Token for Good ?</h2>
                </div>

                {/* Onglets interactifs - simplifié pour Next.js */}
                <div className="div-block-7">
                  <div className="w-layout-grid grid">
                    <div className="div-block-11">
                      <p className="p ptab">✓ Fédérer votre communauté d&apos;alumni</p>
                      <p className="p ptab">✓ Permettre aux membres d&apos;interagir et de développer leurs compétences</p>
                      <p className="p ptab">✓ Mesurer l&apos;impact positif des interactions de la communauté</p>
                      <p className="p ptab">✓ Développer des outils contributifs et innovants avec la technologie blockchain</p>
                    </div>

                    {/* Témoignages */}
                    <div id="w-node-c03912ae-06fb-6ef9-c226-4905b31cbc66-279b90b6" className="divtestimony">
                      <h3 className="h3">Ils ont rejoint Token for Good</h3>
                      
                      <div className="testimony">
                        <div className="quote">
                          <p className="p">
                            &quot;Je trouve l&apos;initiative Token for Good intéressante d&apos;utiliser des technologies 
                            digitales pour permettre au plus grand nombre des acteurs du réseau lightning de 
                            participer à la décentralisation et faciliter les paiements sans contrainte&quot;
                          </p>
                        </div>
                        <div className="div-block-13">
                          <img 
                            src="/landing/images/64512a64fd42ab2ba9adecbb_about-hero.svg" 
                            loading="lazy" 
                            width="64" 
                            height="64" 
                            alt="Photo Edouard Minaget - Node owner" 
                            className="image-9"
                          />
                          <div className="div-block-14">
                            <p className="p name">Edouard Minaget</p>
                            <p className="p firm">Node owner</p>
                          </div>
                        </div>
                      </div>

                      <div className="testimony">
                        <div className="quote">
                          <p className="p">
                            &quot;Le mentoring est un accélérateur de compétences. Cela permet de se connecter 
                            par rapport à des besoins spécifiques et d&apos;aller chercher de manière plus directe 
                            les expériences des autres.&quot;
                          </p>
                        </div>
                        <div className="div-block-13">
                          <img 
                            src="/landing/images/646e02a7f657a4100bf90e58_femmelivre.webp" 
                            loading="lazy" 
                            width="64" 
                            height="64" 
                            alt="Photo Laeticia de Centralise - Network & Development Expert" 
                            className="image-9"
                          />
                          <div className="div-block-14">
                            <p className="p name">Laeticia de Centralise</p>
                            <p className="p firm">Network &amp; Development Expert</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section "Communauté engagée" */}
          <div className="section">
            <div className="w-layout-grid grid">
              <div className="div-block-11">
                <div className="title-circle">
                  <div className="embed100 w-embed">
                    <svg focusable="false" aria-hidden="true" width="1.5rem" height="1.5rem" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M10.0001 2C9.44784 2 9.00013 1.55228 9.00013 1C9.00013 0.447715 9.44784 0 10.0001 0H15.0001C15.5524 0 16.0001 0.447715 16.0001 1V6C16.0001 6.55228 15.5524 7 15.0001 7C14.4478 7 14.0001 6.55228 14.0001 6V3.41421L9.70724 7.70711C9.31671 8.09763 8.68355 8.09763 8.29302 7.70711L6.00013 5.41421L1.70723 9.70711C1.31671 10.0976 0.68354 10.0976 0.293016 9.70711C-0.0975091 9.31658 -0.0975091 8.68342 0.293016 8.29289L5.29302 3.29289C5.68354 2.90237 6.31671 2.90237 6.70723 3.29289L9.00013 5.58579L12.5859 2H10.0001Z" fill="currentColor"></path>
                    </svg>
                  </div>
                </div>
                <h2 className="h2">Une communauté engagée</h2>
                <p className="p">
                  En faisant partie et en contribuant à la plateforme Token For Good, vous aiderez d&apos;autres 
                  utilisateurs et acteurs de la décentralisation du réseau lightning : Créez un profil, 
                  collectez des tokens, gagnez en visibilité, obtenez des certifications et bien d&apos;autres 
                  avantages encore.
                </p>
                <div className="div-block">
                  <Link href="/onboarding" className="bouton _2 w-inline-block">
                    <div className="textbt go">S&apos;inscrire</div>
                  </Link>
                </div>
              </div>
              
              <div id="w-node-_09916e40-224a-fb6f-4926-1e04ea57c1b9-279b90b6" className="div-block-12">
                <img 
                  src="/landing/images/64498a90b962341386fd1430_new-home-hero2.webp" 
                  loading="lazy" 
                  height="296" 
                  alt="Communauté Token for Good - Étudiants et alumni engagés" 
                  className="image-8"
                />
              </div>
            </div>
          </div>

          {/* Section Partenaires */}
          <div className="section">
            <div className="div-block-4">
              <div>
                <div className="title-circle">
                  <div className="embed100 w-embed">
                    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 17H21V15C21 13.3431 19.6569 12 18 12C17.0444 12 16.1931 12.4468 15.6438 13.1429M16 17H6M16 17V15C16 14.3438 15.8736 13.717 15.6438 13.1429M6 17H1V15C1 13.3431 2.34315 12 4 12C4.95561 12 5.80686 12.4468 6.35625 13.1429M6 17V15C6 14.3438 6.12642 13.717 6.35625 13.1429M6.35625 13.1429C7.0935 11.301 8.89482 10 11 10C13.1052 10 14.9065 11.301 15.6438 13.1429M14 4C14 5.65685 12.6569 7 11 7C9.34315 7 8 5.65685 8 4C8 2.34315 9.34315 1 11 1C12.6569 1 14 2.34315 14 4ZM20 7C20 8.10457 19.1046 9 18 9C16.8954 9 16 8.10457 16 7C16 5.89543 16.8954 5 18 5C19.1046 5 20 5.89543 20 7ZM6 7C6 8.10457 5.10457 9 4 9C2.89543 9 2 8.10457 2 7C2 5.89543 2.89543 5 4 5C5.10457 5 6 5.89543 6 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                </div>
                <h2 className="h2">Nos partenaires</h2>
              </div>
              
              <div className="div-block-7">
                <a href="https://dazno.de" target="_blank" rel="noopener noreferrer" className="link-block-2 darkshow w-inline-block">
                  <img src="/landing/images/68dd52b64caafaf589da8e54_logo_daznode.png" loading="lazy" alt="Daznode" height="100" className="imagepartners" />
                </a>
                <a href="https://inoval.io" target="_blank" rel="noopener noreferrer" className="link-block-2 darkshow w-inline-block">
                  <img src="/landing/images/6829aacc00d93f05c170ee5d_64819951ddb9563d1fad1713_INOVAL_logo_RVB-500px.png" loading="lazy" alt="Inoval" height="100" className="imagepartners" />
                </a>
                <a href="https://bit.ly/NantesBitcoin" target="_blank" rel="noopener noreferrer" className="link-block-2 darkshow w-inline-block">
                  <img src="/landing/images/6829aa7694b5a7d4e0195211_Bitcoin%20Meetup.jpg" loading="lazy" height="100" alt="Bitcoin Meetup Nantes" className="imagepartners" />
                </a>
                <a href="https://blockchainforgood.fr/" target="_blank" rel="noopener noreferrer" className="link-block-2 darkshow w-inline-block">
                  <img src="/landing/images/6829aaff379497ff57cdd41f_Blockchain_for_Good.svg" loading="lazy" alt="Blockchain for Good" height="70" className="imagepartners ocode" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="footer">
          <div className="div-block-10">
            <div className="div-block-5">
              <div className="div-block-9 footerdivright">
                <p className="paragraph">We are social!</p>
                <div className="div-block-17">
                  <a aria-label="LinkedIn" href="https://www.linkedin.com/company/token-for-good/" target="_blank" rel="noopener noreferrer" className="link-block-4 w-inline-block">
                    <div className="html-embed linkedin w-embed"></div>
                  </a>
                  <a aria-label="Instagram" href="https://www.instagram.com/tokenforgood_t4g/" target="_blank" rel="noopener noreferrer" className="link-block-4 w-inline-block">
                    <div className="html-embed instagram w-embed"></div>
                  </a>
                  <a aria-label="Twitter" href="https://twitter.com/TokenforGood" target="_blank" rel="noopener noreferrer" className="link-block-4 w-inline-block">
                    <div className="html-embed twitter w-embed"></div>
                  </a>
                  <a aria-label="YouTube" href="https://www.youtube.com/@tokenforgood" target="_blank" rel="noopener noreferrer" className="link-block-4 w-inline-block">
                    <div className="html-embed youtube w-embed"></div>
                  </a>
                  <a aria-label="Discord" href="https://discord.com/invite/5fdrNzUKjy" target="_blank" rel="noopener noreferrer" className="link-block-4 w-inline-block">
                    <div className="html-embed discord w-embed"></div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
