import Link from 'next/link';
import { ButtonIcon, Icons, Tag } from '..';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useLanguage, useMediaQuery } from 'apps/dapp/hooks';
import { trapFocus } from 'apps/dapp/services';
import { CategoryType } from 'apps/dapp/types';

export interface IMenuItem {
  label: string;
  href: string;
  index: number;
  inactive?: boolean;
  handleClose?: () => void;
  useInMobileMenu?: boolean;
}

export interface IMenuItemWithChildrens extends IMenuItem {
  childrens?: Omit<CategoryType, 'index'>[];
}

export const MenuItem: React.FC<IMenuItemWithChildrens> = ({
  label,
  href,
  childrens,
  index,
  inactive,
  handleClose,
  useInMobileMenu,
}) => {
  const isMobile = useMediaQuery(992);

  const router = useRouter();
  const lang = useLanguage();
  const [expanded, setExpanded] = useState<boolean>(
    useInMobileMenu
      ? false
      : router.asPath.startsWith(`${href}/`)
      ? true
      : false
  );
  const subMenuRef = useRef<HTMLDivElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (expanded && useInMobileMenu) {
      backBtnRef?.current?.focus();
    }
  }, [expanded, useInMobileMenu]);

  if (childrens) {
    const handleSubMenuToggle = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (isMobile || !router.asPath.startsWith(`${href}/`)) {
        setExpanded(!expanded);
      }
    };

    const handleSubMenuClose = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setExpanded(!expanded);
      handleClose?.();
    };

    const handleSubMenuBack = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setExpanded(!expanded);
    };

    return (
      <>
        <Link
          key={index}
          className={'c-menu-item--with-childs'}
          role="menuitem"
          aria-haspopup="true"
          aria-expanded={expanded}
          href={href}
          passHref
          onClick={handleSubMenuToggle}
        >
          {label}
          {isMobile ? (
            Icons.toggleRight
          ) : router.asPath.startsWith(`${href}/`) ? null : expanded ? (
            <>
              {Icons.toggleUp}
              <span className="u-sr-only">{lang.utils.close}</span>
            </>
          ) : (
            <>
              {Icons.toggleDown}
              <span className="u-sr-only">{lang.utils.open}</span>
            </>
          )}
        </Link>
        <div
          className="c-menu-item__submenu"
          ref={subMenuRef}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (isMobile && expanded) {
              trapFocus(e, subMenuRef);
            }
          }}
        >
          <ul role="menu" aria-label={label}>
            {isMobile && (
              <li className="u-d--flex u-justify-content-between">
                <button
                  className="c-menu-item__submenu__back-button"
                  type="button"
                  ref={backBtnRef}
                  onClick={handleSubMenuBack}
                >
                  <span className="u-sr-only">{lang.utils.back}</span>
                  {Icons.toggleLeft}
                </button>

                <ButtonIcon
                  variant="tertiary"
                  onClick={(e) => {
                    handleSubMenuClose(e);
                  }}
                  iconName={'close'}
                />
              </li>
            )}

            {isMobile && (
              <li tabIndex={-1}>
                {' '}
                <span className="c-menu-item--with-childs">{label}</span>
              </li>
            )}
            {childrens &&
            
            <li  role="none">
              <Link
                role="menuitem"
                className={
                  router.asPath === `${href}/`
                    ? 'c-menu-item__submenu__item active'
                    : 'c-menu-item__submenu__item'
                }
                href={
                  href === "benefits/"
                    ? ""
                    : `${href}`
                }
                aria-current={router.asPath === `${href}/` ? 'page' : null}
              >
                See all
                {router.asPath === `${href}/` && Icons.iconCheck}
              </Link>
            </li>
            }

            {childrens.map((child: CategoryType, i: number) => {
              let isActive: boolean;
              child.href=`/${encodeURIComponent(child.name)}`
              if (href === child.href) {
                isActive = router.asPath === `${href}/`;
              } else {
                isActive = router.asPath.includes(`${href}${child.href}/`);
              }

              if (child?.disabled) {
                return (
                  <li key={i} role="none">
                    <div
                      role="menuitem"
                      className="c-menu-item__submenu__item inactive"
                    >
                      <span>{child.name}</span>
                      <Tag variant="soon" label={lang.utils.soon} lang={lang} />
                    </div>
                  </li>
                );
              } else {
                return (
                  <li key={i} role="none">
                    <Link
                      role="menuitem"
                      className={
                        isActive
                          ? 'c-menu-item__submenu__item active'
                          : 'c-menu-item__submenu__item'
                      }
                      href={
                        href === child.href
                          ? child.href
                          : `${href}${child.href}`
                      }
                      aria-current={isActive ? 'page' : null}
                    >
                      {child.name}
                      {isActive && Icons.iconCheck}
                    </Link>
                  </li>
                );
              }
            })}
          </ul>
        </div>
      </>
    );
  } else {
    if (inactive) {
      return (
        <div key={index} className={'c-menu-item inactive'} role="menuitem">
          <span>{label}</span>
          <span className="c-menu-item__soon">{lang.utils.soon}</span>
        </div>
      );
    } else {
      return (
        <Link
          key={index}
          className={
            router.asPath === `${href}/` ? 'c-menu-item active' : 'c-menu-item'
          }
          role="menuitem"
          href={href}
          aria-current={router.asPath === `${href}/` ? 'page' : null}
        >
          {label}
        </Link>
      );
    }
  }
};

MenuItem.displayName = 'MenuItem';
