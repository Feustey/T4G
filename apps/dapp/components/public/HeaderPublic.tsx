import Image from 'next/image';
import { Button, ButtonIcon } from '..';
import { useMediaQuery } from '../../hooks';
import Link from 'next/link';
import { LangType, LocaleType } from '../../types';
import { useRouter } from 'next/router';

export interface IHeaderPublic {
  lang: LangType;
}

export const HeaderPublic: React.FC<IHeaderPublic> = ({ lang }) => {
  const router = useRouter();
  const locale = router.locale as LocaleType;

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/${locale}/login`);
  };

  const isMobile = useMediaQuery(992);
  return (
    <header className="c-header">
      <div className="c-header__logo">
        <Link
          href={'/'}
          aria-label={lang.utils.homeButton}
          className="u-d--block"
        >
          {isMobile ? (
            <Image
              alt="Token for good"
              src="/assets/images/png/T4G.png"
              width={72}
              height={60}
              priority
            />
          ) : (
            <Image
              alt="Token for good"
              src="/assets/images/png/T4G.png"
              width={83}
              height={70}
              priority
            />
          )}
        </Link>
      </div>

      {isMobile ? (
        <ButtonIcon
          accessibilityLabel={lang.utils.signIn}
          onClick={handleLogin}
          iconName={'user'}
        />
      ) : (
        <Button
          iconStart={'user'}
          label={lang.utils.signIn}
          variant="primary"
          onClick={handleLogin}
        />
      )}
    </header>
  );
};

HeaderPublic.displayName = 'HeaderPublic';
