import Image from 'next/image';
import { CustomLink, SocialBar, SocialMedia } from '../index';
import { LangType } from '../../types';

export interface IFooterPublic {
  lang: LangType;
}

const socialsNetwork: SocialMedia[] = [
  {
    type: 'linkedin',
    title: 'LinkedIn',
    href: 'https://www.linkedin.com/company/token-for-good/',
  },
  {
    type: 'instagram',
    title: 'Instagram',
    href: 'https://www.instagram.com/tokenforgood_t4g/',
  },
  {
    type: 'twitter',
    title: 'Twitter',
    href: 'https://twitter.com/tokenforgood',
  },
  {
    type: 'youtube',
    title: 'YouTube',
    href: 'https://www.youtube.com/@tokenforgood',
  },
  {
    type: 'discord',
    title: 'Discord',
    href: 'https://discord.gg/5fdrNzUKjy',
  },
  {
    type: 'medium',
    title: 'Medium',
    href: 'https://medium.com/@TokenForGood',
  },
];

export const FooterPublic: React.FC<IFooterPublic> = ({ lang }) => {
  return (
    <footer className={`c-footer--public clearfix`}>
      <div className={`e-container`}>
        <div className={`c-footer--public--top-bar`}>
          <nav className={`c-footer--public-nav`}>
            <ul role="list">
              {lang.components.footer.header.links.map(function (link, i) {
                return (
                  <li key={i}>
                    <CustomLink
                      href={link.link}
                      label={link.label}
                      iconName={link.iconName}
                    />
                  </li>
                );
              })}
            </ul>
          </nav>
          <SocialBar lang={lang} socials={socialsNetwork} />
        </div>
        <div className={`c-footer--public--bottom-bar`}>
          <nav className={`c-footer--public-nav`}>
            <ul role="list">
              {lang.components.footer.bottom.links.map(function (link, i) {
                return (
                  <li key={i}>
                    <CustomLink
                      href={link.link}
                      label={link.label}
                      iconName={link.iconName}
                    />
                  </li>
                );
              })}
            </ul>
          </nav>
          <div>
            <a
              href="https://www.t4g.com/ "
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                alt=""
                src="/assets/images/png/t4g.png"
                width={40}
                height={40}
              />
              <p>by t4g</p>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

FooterPublic.displayName = 'FooterPublic';
