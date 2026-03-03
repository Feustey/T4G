import { UserCVType, UserRoleType } from 'apps/dapp/types';
import { Avatar } from './Avatar';
import Link from 'next/link';
import { capitalise } from 'apps/dapp/services';
import type { User } from 'apps/dapp/services/apiClient';

/** User shape for directory/cards - API may return avatar (legacy) or avatar_url */
type UserCardUser = User & { avatar?: string; about?: string };
import useSwr from 'swr';
import { apiClient } from 'apps/dapp/services/apiClient';
import { Skeleton } from '../shared/Skeleton'; // Supposant que vous avez un composant Skeleton

export interface IUserCard {
  userId: string;
  userRole: UserRoleType | string;
  categorieName?: string;
  parent?: string;
  isLink: boolean;
  isMentorActive?: boolean;
  /** Passer les données user déjà chargées pour éviter une requête individuelle */
  prefetchedUser?: UserCardUser;
}

export const UserCard: React.FC<IUserCard> = ({
  userId,
  userRole,
  categorieName,
  parent,
  isLink,
  isMentorActive,
  prefetchedUser,
}) => {
  // N'effectue la requête individuelle que si les données ne sont pas déjà disponibles
  const { data: fetchedUser, error: userError, isLoading: isUserLoading } = useSwr<UserCardUser>(
    !prefetchedUser && userId ? ['user', userId] : null,
    ([_, id]) => apiClient.getUser(id)
  );
  const user = prefetchedUser ?? fetchedUser;

  const { data: cv, isLoading: isCvLoading } = useSwr<UserCVType>(
    userId ? ['user-cv', userId] : null,
    ([_, id]) => apiClient.getUserCV(id as string)
  );

  const isLoading = isUserLoading || (!prefetchedUser && isCvLoading && !user);
  const error = !prefetchedUser && userError;

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
  if (error || !user) {
    return (
      <div className="c-benefit-card--user p-4 text-center text-red-500">
        Impossible de charger les informations de l&apos;utilisateur.
      </div>
    );
  }

  // Logique d'extraction de l'emoji plus robuste
  const aboutParts = user.about?.split('/splitAbout/');
  const emoji = aboutParts && aboutParts.length > 1 ? aboutParts[1] : '✨';

  const showMentorBadge = isMentorActive ?? user?.is_mentor_active;

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
          avatar={user.avatar ?? user.avatar_url}
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
        <p className="c-benefit-card__infos__place">
          {user.role}
          {showMentorBadge && (
            <span
              style={{
                marginLeft: 6,
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                background: 'var(--color-primary-light, #eff6ff)',
                color: 'var(--color-primary, #2563eb)',
              }}
            >
              Mentor
            </span>
          )}
        </p>
        {isLink && cv && (
          <div className="mt-2">
            {cv.program && (
              <p className="c-benefit-card__infos__job">
                <strong>Programme:</strong> {cv.program}
              </p>
            )}
            {cv.topic && (
              <p className="c-benefit-card__infos__job">
                <strong>Sujet:</strong> {cv.topic}
              </p>
            )}
            {cv.graduatedYear && (
              <p className="c-benefit-card__infos__industry">
                <strong>Diplômé en:</strong> {cv.graduatedYear}
              </p>
            )}
          </div>
        )}
      </div>
    </UserCardLink>
  );
};

UserCard.displayName = 'UserCard';

export interface IUserCardLink {
  user: UserCardUser;
  userRole: UserRoleType | string;
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
