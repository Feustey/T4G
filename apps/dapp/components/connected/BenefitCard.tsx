import { LangType, ReceiveServiceType, UserRoleType } from 'apps/dapp/types';
import { Avatar } from './Avatar';
import Link from 'next/link';
import Image from 'next/image';
import { Rating } from '..';
import { capitalise } from 'apps/dapp/services';

export interface IBenefitCard {
  service: ReceiveServiceType;
  type: 'SERVICES' | 'BENEFITS';
  userRole: UserRoleType;
  lang: LangType; // Ajout de la prop lang pour l'i18n
  categorieName?: string;
  parent?: string;
  isLink: boolean;
}

export const BenefitCard: React.FC<IBenefitCard> = ({
  service,
  type,
  userRole,
  lang, // Récupération de la prop lang
  categorieName,
  parent,
  isLink,
}) => {
  const cardContent = () => {
    if (userRole === 'ALUMNI') {
      return (
        <>
          <p className="c-benefit-card__pricing">
            <Image
              alt={lang.utils.tokenAlt} // i18n pour l'accessibilité
              src="/assets/images/png/token.png"
              width={24}
              height={24}
              className="c-header--connected__token__image"
              priority
            />
            {/* i18n pour le prix */}
            {service?.price}{' '}
            {service?.price > 1 ? lang.utils.tokens : lang.utils.token} /{' '}
            {service?.unit}
          </p>
          <Avatar
            id={''}
            firstname={service.provider?.firstName}
            lastname={service.provider?.lastName}
            isLoading={false}
            avatar={service?.avatar || service?.provider?.avatar}
            size="lg"
          />
          <div className="c-benefit-card__infos">
            <p className="c-benefit-card__infos__name">
              {capitalise(service?.name)}
            </p>
            <p className="c-benefit-card__infos__job">
              {capitalise(service?.provider?.firstName)}{' '}
              {service?.provider?.lastName?.toUpperCase()}
            </p>
            <p className="c-benefit-card__infos__summary">
              {capitalise(service?.summary)}
            </p>
          </div>
        </>
      );
    } else {
      const experienceToDisplay =
        service.provider?.experiences?.find((xp) => xp.isCurrent) ??
        service.provider?.experiences?.[0];

      // Logique d'extraction de l'emoji plus robuste
      const aboutParts = service.provider?.about?.split('/splitAbout/');
      const emoji = aboutParts && aboutParts.length > 1 ? aboutParts[1] : '✨';

      return (
        <>
          <div className="c-benefit-card__avatar-container">
            <Avatar
              id={''}
              firstname={service.provider?.firstName}
              lastname={service.provider?.lastName}
              isLoading={false}
              avatar={service.provider?.avatar}
              size="lg"
            />
            <p className="c-benefit-card__avatar-container__program">
              {service.provider?.program
                ?.split(' ')
                ?.map((word: string) => capitalise(word[0]))}
            </p>
          </div>
          <div className="c-benefit-card__infos">
            <p className="c-benefit-card__infos__name">
              {capitalise(service.provider?.firstName)}{' '}
              {service.provider?.lastName?.toUpperCase()}
            </p>
            <p className="c-benefit-card__infos__emoji">{emoji}</p>
            {experienceToDisplay && (
              <div className="c-benefit-card__infos__job-details">
                <p className="c-benefit-card__infos__job">
                  {capitalise(experienceToDisplay.title)}
                </p>
                <p className="c-benefit-card__infos__company">
                  {capitalise(experienceToDisplay.company)}
                </p>
              </div>
            )}
            {experienceToDisplay?.country && (
              <p className="c-benefit-card__infos__place">
                {experienceToDisplay?.city
                  ? `${capitalise(experienceToDisplay.city)}, `
                  : ''}
                {capitalise(experienceToDisplay.country)}
              </p>
            )}
            {experienceToDisplay?.industry && (
              <p className="c-benefit-card__infos__industry">
                {capitalise(experienceToDisplay.industry)}
              </p>
            )}
            {service?.rating && (
              <Rating
                isEditable={false}
                lang={lang}
                rate={service.rating.length > 0 ? service.rating : [0]}
                nbOpinion={service.rating.length}
              />
            )}
          </div>
        </>
      );
    }
  };

  return (
    <BenefitCardLink
      service={service}
      type={type}
      categorieName={categorieName}
      parent={parent}
      isLink={isLink}
    >
      {cardContent()}
    </BenefitCardLink>
  );
};

BenefitCard.displayName = 'BenefitCard';

export interface IBenefitCardLink {
  service: ReceiveServiceType;
  type: 'SERVICES' | 'BENEFITS';
  categorieName: string;
  parent: string;
  isLink: boolean;
  children: React.ReactNode;
}

export const BenefitCardLink: React.FC<IBenefitCardLink> = ({
  isLink,
  children,
  categorieName,
  parent,
  service,
  type,
}) => {
  if (isLink && parent && categorieName) {
    return (
      <Link
        href={`/${parent}/${encodeURIComponent(categorieName)}/${service.id}`}
        className={`c-benefit-card--${type.toLowerCase()}`}
        passHref
      >
        {children}
      </Link>
    );
  } else {
    return (
      <div className={`c-benefit-card--${type.toLowerCase()}`}>{children}</div>
    );
  }
};

BenefitCardLink.displayName = 'BenefitCardLink';
