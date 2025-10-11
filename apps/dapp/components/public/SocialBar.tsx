import { LangType } from '../../types';

export enum SocialMediaEnum {
  facebook = 'Facebook',
  twitter = 'Twitter',
  instagram = 'Instagram',
  linkedin = 'Linkedin',
  youtube = 'Youtube',
  discord = 'Discord',
  bookmarker = 'Bookmarker',
  medium = 'Medium',
}

export type SocialMedia = {
  type: keyof typeof SocialMediaEnum;
  href: string;
  title?: string;
};

export interface FollowProps {
  socials: SocialMedia[];
  lang: LangType;
  'data-cy'?: string;
}

export const SocialBar: React.FC<FollowProps> = ({ socials, lang }) => {
  return (
    <div className={`c-social-bar`}>
      <p className={`heading-5`}>{lang.components.footer.header.socialTitle}</p>
      <ul
        role="list"
        className="c-button-group c-button-group--inline c-button-group--right"
      >
        {socials.map(({ type, ...rest }) => (
          <li key={`socials-${type}`}>
            <a
              {...rest}
              title={rest.title || type}
              className={`c-button--${type} c-button--socials c-button`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="u-sr-only">{SocialMediaEnum[type]}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

SocialBar.displayName = 'SocialBar';
