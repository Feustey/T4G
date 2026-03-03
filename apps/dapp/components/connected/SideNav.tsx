import Image from 'next/image';
import { LangType } from '../../types';
import type { User } from '../../services/apiClient';
import { Icons, IconsT4G, MenuItem } from '../';
import { useAuth } from '../../contexts/AuthContext';

export interface ISideNav {
  lang: LangType;
  user: User;
}

export const SideNav: React.FC<ISideNav> = ({ lang, user }) => {
  const { logout } = useAuth();

  const renderMenuItems = (menuItems) => {
    return menuItems.map((link, i) => (
      <li role="none" key={i}>
        <MenuItem
          href={link.href}
          label={link.label}
          childrens={link.childrens}
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
          {user.role === 'alumni' && renderMenuItems(lang.navigation.alumni)}
          {user.role === 'mentee' && renderMenuItems(lang.navigation.student)}
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
