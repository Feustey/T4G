import Image from 'next/image';
import { Avatar, BookingButton, Icons } from 'apps/dapp/components';
import { LangType, ReceiveServiceType } from 'apps/dapp/types';
import dynamic from 'next/dynamic';
import { mdToDraftjs } from 'draftjs-md-converter';
import { convertFromRaw, EditorState } from 'draft-js';
import { useMemo } from 'react';

export interface IAlumniBenefitPage {
  benefit: ReceiveServiceType;
  lang: LangType;
}

// Simplification de l'import dynamique
// @ts-expect-error - Problème de typage avec Next.js dynamic et react-draft-wysiwyg
const DraftEditor: any = dynamic(() => import('react-draft-wysiwyg'), {
  ssr: false,
});

export const AlumniBenefitPage: React.FC<IAlumniBenefitPage> = ({
  benefit,
  lang,
}) => {
  // Optimisation de la conversion avec useMemo
  const editorState = useMemo(() => {
    if (benefit.description) {
      try {
        const rawContent = mdToDraftjs(benefit.description);
        const contentState = convertFromRaw(rawContent);
        return EditorState.createWithContent(contentState);
      } catch (error) {
        console.error("Error converting markdown to editor state:", error);
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  }, [benefit.description]);

  return (
    <>
      <section className="c-student-benefit-page__booking">
        <div>
          <Avatar
            id={''}
            firstname={benefit.provider?.firstName}
            lastname={benefit.provider?.lastName}
            isLoading={false}
            avatar={benefit?.avatar || benefit?.provider?.avatar}
            size="lg"
          />
          <p className="u-text--bold u-text--center u-margin-t--m ">
            {benefit?.provider?.firstName} {benefit?.provider?.lastName}
          </p>
          <p className="u-d--flex u-gap--xxs u-align-items-center u-text--bold u-width--fill u-margin--auto u-justify-content-center">
            <Image
              alt={lang.utils.tokenAlt} // i18n pour l'accessibilité
              src="/assets/images/png/token.png"
              width={24}
              height={24}
              className="c-header--connected__token__image"
              priority
            />
            {/* i18n pour le prix */}
            {benefit?.price}{' '}
            {benefit?.price > 1
              ? lang.components.alumniBenefitPage.tokens
              : lang.components.alumniBenefitPage.token}{' '}
            / {benefit?.unit}
          </p>
        </div>

        <BookingButton
          theme="BENEFITS"
          type="BOOK"
          serviceId={benefit.id}
          lang={lang}
          label={lang.components.alumniBenefitPage.choose} // i18n
          cssClassName="u-width--fill"
          // Correction du bug (firstName -> lastName)
          serviceName={`${
            benefit?.provider?.firstName
          } ${benefit?.provider?.lastName?.toUpperCase()}`}
          servicePrice={benefit.price}
        />
      </section>
      <section className="c-student-benefit-page__infos">
        <h1 className="heading-2 ">{benefit.name}</h1>

        <div>
          <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin-b--m">
            {Icons.chat} {lang.components.alumniBenefitPage.about} {/* i18n */}
          </h2>
          <DraftEditor.Editor
            editorClassName="editorClassName prose w-full self-stretch m-auto"
            readOnly
            toolbarHidden
            toolbar={{
              link: { showOpenOptionOnHover: false },
            }}
            editorState={editorState} // Utilisation de l'état mémorisé
          />
        </div>
      </section>
    </>
  );
};

AlumniBenefitPage.displayName = 'AlumniBenefitPage';
