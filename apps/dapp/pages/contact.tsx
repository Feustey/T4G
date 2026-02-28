import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useIndexing } from '../hooks';
import { LangType, LocaleType } from '../types';
import PublicLayout from '../layouts/PublicLayout';

export interface IContactPage {
  lang: LangType;
}

export default function ContactPage({ lang }: IContactPage) {
  const router = useRouter();
  const locale = router.locale as LocaleType;

  return (
    <>
      <Head>
        <title>{lang.page.contact.head.title}</title>
        <meta name="description" content={lang.page.contact.head.metaDesc} />
        {useIndexing(true)}
      </Head>
      <PublicLayout lang={lang}>
        <section className="max-w-2xl mx-auto px-6 py-16 md:py-24">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {lang.page.contact.main.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            {lang.page.contact.main.p}
          </p>
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Contact par email
              </h2>
              <a
                href="mailto:contact@token-for-good.com"
                className="text-t4g-blue-500 hover:text-t4g-blue-600 dark:text-t4g-green-400 dark:hover:text-t4g-green-300 font-medium underline underline-offset-2"
              >
                contact@token-for-good.com
              </a>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <Image
                src="/landing/images/64493f2065a2a70b35c533b1_svgviewer-png-output(1).webp"
                alt="Token for Good - Plateforme collaborative Web3"
                width={400}
                height={400}
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="pt-4">
              <Link
                href="/"
                locale={locale}
                className="inline-flex items-center text-t4g-blue-500 hover:text-t4g-blue-600 dark:text-t4g-green-400 dark:hover:text-t4g-green-300 font-medium"
              >
                ← Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </section>
      </PublicLayout>
    </>
  );
}

export const getServerSideProps = () => ({ props: {} });
