import Image from 'next/image';
import { useMediaQuery } from '../../hooks';
import Link from 'next/link';
import { LangType } from '../../types';

export interface IHeaderOnboarding {
  lang: LangType;
}

export const HeaderOnboarding: React.FC<IHeaderOnboarding> = ({ lang }) => {
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
    </header>
  );
};

HeaderOnboarding.displayName = 'HeaderOnboarding';
