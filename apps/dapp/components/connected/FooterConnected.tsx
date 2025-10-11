import Image from 'next/image';
import { CustomLink } from '../index';
import { LangType } from '../../types';

export interface IFooterConnected {
  lang: LangType;
}

export const FooterConnected: React.FC<IFooterConnected> = ({ lang }) => {
  return (
    <footer className={`c-footer--connected`}>
      <nav className={`c-footer--connected__nav`}>
        <ul role="list" className="c-footer--connected__link-list">
          <li>
            <ul role="list">
              {lang.components.footerConnected.links.part1.map(function (
                link,
                i
              ) {
                return (
                  <li key={i}>
                    <CustomLink
                      href={link.link}
                      label={link.label}
                      iconName={link.iconName}
                      external={link.link.startsWith('https://') ? true : false}
                      newWindow={
                        link.link.startsWith('https://') ? true : false
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </li>
          {/* Uncomment if part2 links come back */}
          {/* <li>
            <ul role="list" >
              {lang.components.footerConnected.links.part2.map(function (
                link,
                i
              ) {
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
          </li> */}
        </ul>
      </nav>
      <div className="u-margin-l--auto">
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
            className="u-color-scheme--dark u-margin-b--m u-margin-l--auto"
          />
          <Image
            alt=""
            src="/assets/images/png/t4g-dark.png"
            width={40}
            height={40}
            className="u-color-scheme--light u-margin-b--m u-margin-l--auto"
          />
          <p className="u-margin--none">by t4g</p>
        </a>
      </div>
    </footer>
  );
};

FooterConnected.displayName = 'FooterConnected';
