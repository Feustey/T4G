import Link from 'next/link';
import { LinkHTMLAttributes } from 'react';
import { Icons, IconsT4G } from '../index';

export interface ICustomLink extends LinkHTMLAttributes<HTMLAnchorElement> {
  label: string;
  href: string;
  iconName?: string | keyof IconsT4G;
  external?: boolean;
  CssClassName?: string;
  newWindow?: boolean;
}

export const CustomLink: React.FC<ICustomLink> = ({
  href,
  label,
  iconName,
  external,
  newWindow,
  CssClassName,
}) => {
  return (
    <Link
      className={`c-custom-link ${CssClassName}`}
      href={href}
      target={newWindow ? '_blank' : null}
      rel={external ? 'noopener noreferrer' : null}
    >
      {' '}
      {label} {iconName ? <span>{Icons[iconName as keyof IconsT4G]}</span> : ''}{' '}
    </Link>
  );
};

CustomLink.displayName = 'CustomLink';
