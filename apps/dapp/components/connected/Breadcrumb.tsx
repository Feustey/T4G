import Link from 'next/link';
import { Icons } from '..';
import { useMediaQuery } from 'apps/dapp/hooks';

export interface IBreadcrumbLink {
  text: string;
  link?: string;
  parent?: boolean;
}

export interface IBreadcrumb {
  links: IBreadcrumbLink[];
}

export const Breadcrumb: React.FC<IBreadcrumb> = ({ links }) => {
  const isMobile = useMediaQuery(992);
  if (isMobile) {
    return (
      <nav aria-label="breadcrumb">
        <Link
          className="c-breadcrumb__link"
          href={
            links.find((link: IBreadcrumbLink) => link.parent === true).link
          }
        >
          {Icons.toggleLeft} {links.find((link) => link?.parent === true).text}
        </Link>
      </nav>
    );
  } else {
    return (
      <nav aria-label="breadcrumb">
        <ul role="list" className="c-breadcrumb">
          {links.map((link: IBreadcrumbLink, i: number) => {
            return (
              <li key={i}>
                {link?.link ? (
                  <Link className="c-breadcrumb__link" href={link.link}>
                    {link.text} {Icons.toggleRight}
                  </Link>
                ) : (
                  <span aria-current="page">{link.text}</span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }
};

Breadcrumb.displayName = 'Breadcrumb';
