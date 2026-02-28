import Head from 'next/head';
import {
  LandingNavbar,
  LandingFooter,
  LandingPartners,
} from '../components/landing';
import { LangType } from '../types';
import { useIndexing } from '../hooks';

export interface IAboutPage {
  lang: LangType;
}

export default function AboutPage({ lang }: IAboutPage) {
  const about = lang.page.about;
  const videoId = about.main.section1.videoSrc.split('v=')[1];

  return (
    <>
      <Head>
        <title>{about.head.title}</title>
        <meta name="description" content={about.head.metaDesc} />
        {useIndexing(true)}
      </Head>

      <style dangerouslySetInnerHTML={{
        __html: `
          .landing-page .landing-icon-sm svg,
          .landing-page .landing-icon-md svg { flex-shrink: 0; width: 1.25rem !important; height: 1.25rem !important; max-width: 2.5rem; max-height: 2.5rem; }
          .landing-page .landing-social-icon svg { flex-shrink: 0; width: 1.25rem !important; height: 1.25rem !important; max-width: 1.5rem; max-height: 1.5rem; }
          .landing-page .landing-nav-icon svg { flex-shrink: 0; width: 1.25rem !important; height: 1.25rem !important; max-width: 1.5rem; max-height: 1.5rem; }
          .landing-page .landing-partner-img { max-width: 180px; max-height: 100px; object-fit: contain; }
        `,
      }} />

      <div className="landing-page min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <LandingNavbar />

        <main>
          {/* Titre principal */}
          <section className="pt-28 pb-12 md:pt-36 md:pb-16 text-center">
            <div className="max-w-6xl mx-auto px-6 md:px-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
                {about.main.title1}
              </h1>
            </div>
          </section>

          {/* Section 1 — Le concept T4G */}
          <section className="py-16 md:py-20">
            <div className="max-w-6xl mx-auto px-6 md:px-8">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="landing-icon-sm shrink-0 w-10 h-10 rounded-full bg-t4g-blue-500/20 flex items-center justify-center text-t4g-blue-500 mb-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {about.main.section1.title}
                </h2>
              </div>
              <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-xl aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={about.main.section1.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          </section>

          {/* Section 2 — Notre histoire */}
          <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800/30">
            <div className="max-w-4xl mx-auto px-6 md:px-8">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="landing-icon-sm shrink-0 w-10 h-10 rounded-full bg-t4g-green-500/20 flex items-center justify-center text-t4g-green-500 mb-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {about.main.section2.title}
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
                {about.main.section2.text
                  .split('\n')
                  .filter((p: string) => p.trim())
                  .map((paragraph: string, i: number) => (
                    <p key={i}>{paragraph.trim()}</p>
                  ))}
              </div>
            </div>
          </section>

          {/* Section 3 — Notre vision */}
          <section className="py-16 md:py-20">
            <div className="max-w-4xl mx-auto px-6 md:px-8">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="landing-icon-sm shrink-0 w-10 h-10 rounded-full bg-t4g-blue-500/20 flex items-center justify-center text-t4g-blue-500 mb-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {about.main.section3.title}
                </h2>
              </div>
              <blockquote className="text-xl md:text-2xl italic font-medium text-gray-700 dark:text-gray-200 text-center max-w-3xl mx-auto px-8 py-8 rounded-2xl bg-gradient-to-br from-t4g-blue-500/5 to-t4g-green-500/5 border border-t4g-blue-500/10">
                {about.main.section3.text}
              </blockquote>
            </div>
          </section>

          {/* Section 4 — Nos valeurs */}
          <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800/30">
            <div className="max-w-6xl mx-auto px-6 md:px-8">
              <div className="flex flex-col items-center text-center mb-12">
                <div className="landing-icon-sm shrink-0 w-10 h-10 rounded-full bg-t4g-green-500/20 flex items-center justify-center text-t4g-green-500 mb-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {about.main.section4.title}
                </h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {about.main.section4.values.map((item: { value: string; text: string }) => (
                  <div
                    key={item.value}
                    className="flex flex-col items-center sm:items-start gap-3 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-t4g-green-500/30 transition-all duration-300 shadow-sm text-center sm:text-left"
                  >
                    <div className="landing-icon-md shrink-0 w-10 h-10 rounded-lg bg-t4g-green-500/20 text-t4g-green-500 flex items-center justify-center">
                      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-t4g-blue-500 dark:text-t4g-green-400 mb-1">{item.value}</p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 5 — Nos partenaires */}
          <LandingPartners />
        </main>

        <LandingFooter />
      </div>
    </>
  );
}

export const getServerSideProps = () => ({ props: {} });
