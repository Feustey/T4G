import { UserCVType, UserRoleType } from 'apps/dapp/types';
import { Avatar } from './Avatar';
import Link from 'next/link';
import { capitalise } from 'apps/dapp/services';
import { User } from '../../lib/types';
import useSwr from 'swr';
import { apiFetcher } from 'apps/dapp/services/config';
import { Skeleton } from '../shared/Skeleton'; // Supposant que vous avez un composant Skeleton

export interface IUserCard {
  userId: string;
  userRole: UserRoleType;
  categorieName?: string;
  parent?: string;
  isLink: boolean;
}

export const UserCard: React.FC<IUserCard> = ({
  userId,
  userRole,
  categorieName,
  parent,
  isLink,
}) => {
  const { data: cv, error: cvError, isLoading: isCvLoading } = useSwr<UserCVType>(
    userId ? `/users/${userId}/cv` : null,
    apiFetcher
  );
  const { data: user, error: userError, isLoading: isUserLoading } = useSwr<User>(
    userId ? `/users/${userId}` : null,
    apiFetcher
  );

  const isLoading = isCvLoading || isUserLoading;
  const error = cvError || userError;

  // Afficher un état de chargement (squelette)
  if (isLoading) {
    return (
      <div className="c-benefit-card--user p-4">
        <div className="flex items-center">
          <Skeleton variant="circular" width={80} height={80} />
          <div className="ml-4 flex-1">
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </div>
        </div>
        <Skeleton variant="rectangular" height={60} className="mt-4" />
      </div>
    );
  }

  // Afficher un état d'erreur
  if (error || !user || !cv) {
    return (
      <div className="c-benefit-card--user p-4 text-center text-red-500">
        Impossible de charger les informations de l&apos;utilisateur.
      </div>
    );
  }

  // Logique d'extraction de l'emoji plus robuste
  const aboutParts = user.about?.split('/splitAbout/');
  const emoji = aboutParts && aboutParts.length > 1 ? aboutParts[1] : '✨';

  return (
    <UserCardLink
      user={user}
      userRole={userRole}
      categorieName={categorieName}
      parent={parent}
      isLink={isLink}
    >
      <div className="c-benefit-card__avatar-container">
        <Avatar
          id={user.id}
          firstname={user.firstname}
          lastname={user.lastname}
          isLoading={false}
          avatar={user.avatar}
          size="lg"
        />
        <p className="c-benefit-card__avatar-container__program">
          {user.program
            ?.split(' ')
            ?.map((word: string) => capitalise(word[0]))
            .join('')}
        </p>
      </div>
      <div className="c-benefit-card__infos">
        <p className="c-benefit-card__infos__name">
          {capitalise(user.firstname)} {user.lastname?.toUpperCase()}
        </p>
        <p className="c-benefit-card__infos__emoji">{emoji}</p>
        <p className="c-benefit-card__infos__place">{user.role}</p>
        {isLink && (
          <div className="mt-2">
            <p className="c-benefit-card__infos__job">
              <strong>Programme:</strong> {cv.program}
            </p>
            <p className="c-benefit-card__infos__job">
              <strong>Sujet:</strong> {cv.topic}
            </p>
            <p className="c-benefit-card__infos__industry">
              <strong>Diplômé en:</strong> {cv.graduatedYear}
            </p>
          </div>
        )}
      </div>
    </UserCardLink>
  );
};

UserCard.displayName = 'UserCard';

export interface IUserCardLink {
  user: User;
  userRole: UserRoleType;
  categorieName?: string; // Rendu optionnel car non utilisé dans l'URL
  parent: string;
  isLink: boolean;
  children: React.ReactNode;
}

export const UserCardLink: React.FC<IUserCardLink> = ({
  isLink,
  children,
  parent,
  user,
}) => {
  if (isLink && parent) {
    // Note: categorieName n'est pas utilisé ici.
    return (
      <Link
        href={`/${parent}/${user.id}`}
        className={`c-benefit-card--user`}
        passHref
      >
        {children}
      </Link>
    );
  } else {
    return <div className={`c-benefit-card--user`}>{children}</div>;
  }
};

UserCardLink.displayName = 'UserCardLink';
