import Head from 'next/head';
import Link from 'next/link';
import { LandingNavbar, LandingFooter } from '../components/landing';
import { LangType } from '../types';
import { useIndexing } from '../hooks';

export interface ILegalMentionPage {
  lang: LangType;
}

export default function LegalMentionPage({ lang }: ILegalMentionPage) {
  const lm = lang.page.legalMention;
  const s1 = lm.main.section1;

  return (
    <>
      <Head>
        <title>{lm.head.title}</title>
        <meta name="description" content={lm.head.metaDesc} />
        {useIndexing(true)}
      </Head>

      <style dangerouslySetInnerHTML={{
        __html: `
          .landing-page .landing-nav-icon svg { flex-shrink: 0; width: 1.25rem !important; height: 1.25rem !important; max-width: 1.5rem; max-height: 1.5rem; }
          .landing-page .landing-social-icon svg { flex-shrink: 0; width: 1.25rem !important; height: 1.25rem !important; max-width: 1.5rem; max-height: 1.5rem; }
        `,
      }} />

      <div className="landing-page min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <LandingNavbar />

        <main className="pt-28 pb-20 md:pt-36 md:pb-28">
          <div className="max-w-3xl mx-auto px-6 md:px-8">

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12">
              {lm.main.title1}
            </h1>

            {/* Section 1 — CGU */}
            <section className="mb-10">
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                  {s1.text1}
                  <Link href="https://token-for-good.com" target="_blank" rel="noopener noreferrer" className="text-t4g-blue-500 hover:underline">
                    {s1.linkt4g}
                  </Link>
                  {s1.text2}
                </p>
                <p>{s1.text3}</p>
                <p>{s1.text4}</p>
                <p>
                  {s1.text5}
                  <Link href="https://token-for-good.com" target="_blank" rel="noopener noreferrer" className="text-t4g-blue-500 hover:underline">
                    {s1.linkt4g}
                  </Link>
                  {s1.text6}
                </p>
                <p>{s1.text7}</p>
                <p>
                  {s1.text8}
                  <Link href="https://token-for-good.com" target="_blank" rel="noopener noreferrer" className="text-t4g-blue-500 hover:underline">
                    {s1.linkt4g}
                  </Link>
                  {s1.text9}
                  <Link href="https://token-for-good.com" target="_blank" rel="noopener noreferrer" className="text-t4g-blue-500 hover:underline">
                    {s1.linkt4g}
                  </Link>
                  {s1.text10}
                </p>
                <p>{s1.text11}</p>
                <p>{s1.text12}</p>
                <p>
                  {s1.text13}
                  <Link href="https://token-for-good.com" target="_blank" rel="noopener noreferrer" className="text-t4g-blue-500 hover:underline">
                    {s1.linkt4g}
                  </Link>
                  {s1.text14}
                </p>
                <p>
                  {s1.text15}
                  <Link href="https://token-for-good.com" target="_blank" rel="noopener noreferrer" className="text-t4g-blue-500 hover:underline">
                    {s1.linkt4g}
                  </Link>
                  {s1.text16}
                </p>
                <p>{s1.text17}</p>
              </div>
            </section>

            <hr className="border-gray-200 dark:border-gray-700 mb-10" />

            {/* Section 2 — Données techniques */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {lm.main.title2}
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>{lm.main.section2.text1}</p>
                <p>{lm.main.section2.text2}</p>
              </div>
            </section>

            <hr className="border-gray-200 dark:border-gray-700 mb-10" />

            {/* Section 3 — Propriété intellectuelle */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {lm.main.title3}
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>{lm.main.section3.text1}</p>
                <p>{lm.main.section3.text2}</p>
                <p>{lm.main.section3.text3}</p>
              </div>
            </section>

            <hr className="border-gray-200 dark:border-gray-700 mb-10" />

            {/* Section 4 — Données personnelles */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {lm.main.title4}
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>{lm.main.section4.text1}</p>
                <p>{lm.main.section4.text2}</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>{lm.main.section4.text3}</li>
                  <li>
                    {lm.main.section4.text4.replace('contact@token-for-good.com', '')}
                    <a
                      href="mailto:contact@token-for-good.com"
                      className="text-t4g-blue-500 hover:underline"
                    >
                      contact@token-for-good.com
                    </a>
                  </li>
                </ul>
              </div>
            </section>

          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  );
}

export const getServerSideProps = () => ({ props: {} });
