import { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAppContext } from '@t4g/ui/providers';
import { BenefitCard, Button, Icons } from 'apps/dapp/components';
import { capitalise } from 'apps/dapp/services';
import {
  LangType,
  LocaleType,
  ReceiveServiceType,
  UserExperienceType,
} from 'apps/dapp/types';
import { BookModal } from './BookModal';

export interface IStudentBenefitPage {
  benefit: ReceiveServiceType;
  lang: LangType;
}

const formatDate = (
  date: string | Date | number,
  locale: LocaleType,
  lang: LangType
): string => {
  if (!date) return '';

  try {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short'
    };
    return d.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Invalid date for formatting:', date);
    return 'Invalid date';
  }
};

export const StudentBenefitPage: React.FC<IStudentBenefitPage> = ({
  benefit,
  lang,
}) => {
  const router = useRouter();
  const locale = router.locale as LocaleType;
  const { setModal } = useAppContext();

  const aboutText = useMemo(() => {
    const parts = benefit?.provider?.about?.split('/splitAbout/');
    return parts?.[0] || '';
  }, [benefit?.provider?.about]);

  return (
    <>
      <section className="c-student-benefit-page__booking">
        <BenefitCard
          service={benefit}
          type="BENEFITS"
          userRole="STUDENT"
          lang={lang}
          isLink={false}
        />

        <Button
          className="u-width--fill"
          onClick={(e) => {
            e.preventDefault();
            setModal({
              component: <BookModal lang={lang} benefit={benefit} />,
            });
          }}
          theme="BENEFITS"
          variant="primary"
          label={lang.components.studentBenefitPage.scheduleAppointment}
        />

        <div className="o-card">
          <h3 className="heading-4">
            {lang.components.studentBenefitPage.serviceOffered}
          </h3>
          <ul>
            <li className="u-margin-b--m u-d--flex u-gap--xs u-flex-wrap">
              <span>{benefit?.category?.name}:</span>
              <span className="u-text--bold u-d--flex u-gap--xs">
                <Image
                  alt={lang.utils.tokenAlt}
                  src="/assets/images/png/token.png"
                  width={24}
                  height={24}
                  className="c-header--connected__token__image"
                  priority
                />
                {benefit?.price}{' '}
                {benefit?.price > 1 ? lang.utils.tokens : lang.utils.token} /{' '}
                {benefit?.unit}
              </span>
            </li>
          </ul>
        </div>
      </section>
      <section className="c-student-benefit-page__infos">
        {aboutText && (
          <div>
            <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin-b--m">
              {Icons.chat}{' '}
              {lang.components.studentBenefitPage.aboutProvider.replace(
                '{name}',
                capitalise(benefit?.provider?.firstName)
              )}
            </h2>
            <p>{aboutText}</p>
          </div>
        )}

        <div className="u-d--flex flex-wrap">
          <div className="w-full lg:w-1/2 lg:pr-14">
            <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin-b--m">
              {Icons.briefcase}{' '}
              {lang.components.studentBenefitPage.professionalExperience}
            </h2>
            <ul role="list" className="u-d--flex u-flex-column u-gap--m">
              {benefit.provider?.experiences?.map(
                (xp: UserExperienceType, index: number) => (
                  <li key={index}>
                    <p className="u-margin--none u-text--bold">
                      {capitalise(xp.title)} <br /> {capitalise(xp.company)}
                    </p>
                    <p className="u-margin--none">
                      {formatDate(xp.from, locale, lang)} -{' '}
                      {xp.isCurrent
                        ? 'Now'
                        : formatDate(xp.to, locale, lang)}
                    </p>
                    <p className="u-margin--none">
                      {xp.city ? `${capitalise(xp.city)}, ` : ''}
                      {capitalise(xp.country)}
                    </p>
                    {xp.industry && (
                      <p className="u-margin--none text-blue-007">
                        {capitalise(xp.industry)}
                      </p>
                    )}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="w-full lg:w-1/2 lg:pr-14">
            <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin-b--m">
              {Icons.academicCap} {lang.components.studentBenefitPage.education}
            </h2>
            <div>
              <p className="u-margin--none u-text--bold">
                {benefit.provider.program}
              </p>
              <p className="u-margin--none">{benefit.provider.graduatedYear}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

StudentBenefitPage.displayName = 'StudentBenefitPage';
