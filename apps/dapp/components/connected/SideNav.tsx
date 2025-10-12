import Image from 'next/image';
import { CategoryType, LangType, SessionType } from '../../types';
import { CustomLink, Icons, IconsT4G, MenuItem } from '../';
import { useRouter } from 'next/router';
import { UserType } from '@shared/types';
import useSwr from 'swr';
import { apiFetcher } from 'apps/dapp/services/config';
import { useAuth } from '../../contexts/AuthContext';
// import * as Sentry from '@sentry/nextjs';

export interface ISideNav {
  lang: LangType;
  user: UserType;
}

export const SideNav: React.FC<ISideNav> = ({ lang, user }) => {
  const router = useRouter();
  const { logout } = useAuth();

  const { data: categorieList } = useSwr<Omit<CategoryType, 'index'>[]>(
    '/service-categories/as_consumer',
    apiFetcher
  ); //TODO error

  const renderMenuItems = (menuItems) => {
    return menuItems.map((link, i) => (
      <li role="none" key={i}>
        <MenuItem
          href={link.href}
          label={link.label}
          childrens={link.label=="Benefits"&&categorieList}
          inactive={link?.inactive || undefined}
          index={i}
        />
      </li>
    ));
  };

  return (
    <nav className="c-side-nav">
      <div>
        <Image
          className="u-margin--auto u-width--fill"
          src={'/assets/images/png/tiki-side-nav.png'}
          alt={''}
          priority
          height={218}
          width={243}
        />
        <ul role="menubar">
          {user.role === 'ALUMNI' && renderMenuItems(lang.navigation.alumni)}
          {user.role === 'STUDENT' && renderMenuItems(lang.navigation.student)}
        </ul>
      </div>
      
      <div
        className={"c-custom-link cursor-pointer"}
        onClick={(e)=>{
          e.preventDefault();
          logout();
        }}
      >
        {' '}
        {lang.utils.signOut} { <span>{Icons["logout" as keyof IconsT4G]}</span> }{' '}
      </div>
    </nav>
  );
};

SideNav.displayName = 'SideNav';
