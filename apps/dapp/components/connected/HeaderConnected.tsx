import Link from 'next/link';
import { LangType, UserType } from '../../types';
import { useMediaQuery } from 'apps/dapp/hooks';
import Image from 'next/image';
import { Avatar, MobileMenu } from '../';
import { useEffect, useState } from 'react';
import { getUserAvatar } from 'apps/dapp/services';
import { useRouter } from 'next/router';

export interface IHeaderConnected {
  lang: LangType;
  userBalance: number;
  user: UserType;
}

export const HeaderConnected: React.FC<IHeaderConnected> = ({
  lang,
  userBalance,
  user,
}) => {
  const isMobile = useMediaQuery(992);
  const [isAvatarLoading, setIsAvatarLoading] = useState<boolean>(true);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAvatar = async () => {
      setIsAvatarLoading(true);
      const avatar = await getUserAvatar(user.id);
      setUserAvatar(avatar);
      setIsAvatarLoading(false);
    };
    fetchUserAvatar();
  }, [user.id]);

  return (
    <header className="c-header--connected">
      {isMobile ? <MobileMenu lang={lang} user={user} /> : null}
      <div className="c-header__logo">
        <Link
          href={'/dashboard'}
          aria-label={lang.utils.homeButton}
          className="u-d--block"
        >
          {isMobile ? (
            <Image
              alt="Token for good"
              src="/assets/images/png/T4G.png"
              width={52}
              height={44}
              priority
            />
          ) : (
            <Image
              alt="Token for good"
              src="/assets/images/png/T4G.png"
              width={76}
              height={64}
              priority
            />
          )}
        </Link>
      </div>
      <div className="u-d--flex u-gap--m">
        <Link
          className="c-header--connected__token-container"
          href={'/wallet'}
          aria-current={router.asPath === '/wallet/' ? 'page' : null}
          passHref
        >
          <Image
            alt=""
            src="/assets/images/png/token.png"
            width={24}
            height={24}
            className="c-header--connected__token__image"
            priority
          />
          <p>{userBalance}</p>
        </Link>
        <Link
          className="c-header--connected__avatar-container"
          href={'/profile'}
          passHref
          aria-current={router.asPath === '/profile/' ? 'page' : null}
        >
          <Avatar
            id={'avatar'}
            isEditable={false}
            avatar={userAvatar}
            firstname={user.firstname}
            lastname={user.lastname}
            isDisplayingName={false}
            isLoading={isAvatarLoading}
            size={isMobile ? 'xs' : 'sm'}
          />
          {isMobile ? null : <p>{user.firstname}</p>}
        </Link>
      </div>
    </header>
  );
};

HeaderConnected.displayName = 'HeaderConnected';
