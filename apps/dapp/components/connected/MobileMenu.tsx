import { CategoryType, LangType } from '../../types';
import { ButtonIcon, CustomLink, Icons, MenuItem } from '../';
import { useRouter } from 'next/router';
import { UserType } from '../../lib/shared-types';
import { useRef, useState, useEffect } from 'react';
import { trapFocus } from 'apps/dapp/services';
import { apiFetcher } from 'apps/dapp/services/config';
import useSwr from 'swr';
import { useAuth } from '../../contexts/AuthContext';

export interface IMobileMenu {
  lang: LangType;
  user: UserType;
}

export const MobileMenu: React.FC<IMobileMenu> = ({ lang, user }) => {  
  const { data: categorieList } = useSwr<Omit<CategoryType, 'index'>[]>(
    '/service-categories/as_consumer',
    apiFetcher
  ); //TODO error
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (typeof window != 'undefined' && window.document) {
        document.body.style.overflow = 'hidden';
      }
      closeBtnRef?.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        trapFocus(e, menuRef);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      if (typeof window != 'undefined' && window.document) {
        document.body.style.overflow = 'auto';
      }
    }
  }, [isOpen]);

  const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleCloseMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpen(false);
  };

  const handleSignOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    logout();
  };

  return (
    <nav role="navigation" aria-label="Main menu">
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="c-mobile-menu__open-button"
        onClick={handleMenuToggle}
      >
        {Icons.menu}
        <span className="u-sr-only">{lang.utils.openMenu}</span>
      </button>

      {isOpen && (
        <div className="c-mobile-menu__menubar" ref={menuRef}>
          <ButtonIcon
            innerRef={closeBtnRef}
            className="c-mobile-menu__menubar__close-button"
            variant="tertiary"
            onClick={(e) => {
              handleCloseMenu(e);
            }}
            iconName={'close'}
          />
          <ul role="menubar" className="c-mobile-menu__menubar__menu-container">
            {user.role === 'ALUMNI' &&
              lang.navigation.alumni.map((link, i) => (
                <li role="none" key={i}>
                  <MenuItem
                    href={link.href}
                    label={link.label}
                    childrens={link.label=="Benefits"&&categorieList}
                    index={i}
                    handleClose={() => setIsOpen(false)}
                    useInMobileMenu={true}
                  />
                </li>
              ))}
            {user.role === 'STUDENT' &&
              lang.navigation.student.map((link, i) => (
                <li key={i}>
                  <MenuItem
                    href={link.href}
                    label={link.label}
                    index={i}
                    childrens={link.label=="Benefits"&&categorieList}
                    useInMobileMenu={true}
                    handleClose={() => setIsOpen(false)}
                  />
                </li>
              ))}
          </ul>
          <CustomLink
            label={lang.utils.signOut}
            href={'/'}
            iconName="logout"
            onClick={handleSignOut}
          />
        </div>
      )}
    </nav>
  );
};

MobileMenu.displayName = 'MobileMenu';
