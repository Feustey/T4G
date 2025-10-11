import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Button, ButtonGroup } from '../components';
import PublicLayout from '../layouts/PublicLayout';
import { useIndexing } from '../hooks';
import { LangType, LocaleType } from '../types';

export interface ICustom500 {
  lang: LangType;
}

export default function Custom500({ lang }: ICustom500) {
  const router = useRouter();
  const locale = router.locale as LocaleType;
  return (
    <>
      <Head>
        <title>{lang.page.error.head.error500.title}</title>
        {useIndexing(false)}
      </Head>
      <PublicLayout lang={lang}>
        <section className={`o-hero--error`}>
          <div className={`o-media o-media-fill`}>
            <Image alt="" src="/assets/images/png/error.png" fill priority />
          </div>
          <div>
            <h1 className="u-margin-b--l">
              {lang.page.error.main.title.part1} 500{' '}
              {lang.page.error.main.title.part2}
            </h1>
            <figure className="u-margin-b--l">
              <blockquote>
                <p className="u-text--bold u-text-size--regular">
                  {lang.page.error.main.quote.quote}
                </p>
              </blockquote>
              <figcaption>
                — {lang.page.error.main.quote.author} -{' '}
                <cite>{lang.page.error.main.quote.place}</cite>
              </figcaption>
            </figure>
            <p className="u-margin-b--l">{lang.page.error.main.p.error500}</p>
            <ButtonGroup inline={true}>
              <Button
                label={lang.page.error.main.buttonPrimary.label}
                key={'1'}
                variant="primary"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/', '/', { locale: locale });
                }}
              />
              <Button
                label={lang.page.error.main.buttonSecondary.label}
                key={'2'}
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/contact', '/contact', { locale: locale });
                }}
              />
            </ButtonGroup>
          </div>
        </section>
      </PublicLayout>
    </>
  );
}
