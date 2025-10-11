import Image from 'next/image';
import { LangType } from '../../types';

export interface IPartners {
  partnerUrl?: string;
  partnerLogoSrc?: string;
  partnerLogoWidth?: number;
  partnerLogoHeight?: number;
  partnerLogoTitle?: string;
  lang: LangType;
}

export const Partners: React.FC<IPartners> = ({ lang }) => {
  return (
    <ul role="list" className="c-partner--list">
      <li className={`c-partner--list-item  `}>
        <a
          href="https://www.t4g.com/"
          title={`t4g alumni - ${lang.utils.newWindow}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            loading="lazy"
            className="u-color-scheme--light"
            alt="t4g alumni"
            src="/assets/images/png/t4g-alumni.png"
            height={40}
            width={180}
          />
          <Image
            loading="lazy"
            className="u-color-scheme--dark"
            alt="t4g alumni"
            src="/assets/images/png/t4g-alumni-blanc.png"
            height={40}
            width={180}
          />
        </a>
      </li>

      <li className={`c-partner--list-item`}>
        <a
          href="https://about.t4g.com/t4g/gaia-lecole-de-la-transition-ecologique-et-sociale/"
          title={`Gaïa - ${lang.utils.newWindow}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            loading="lazy"
            className="u-color-scheme--light"
            alt="Gaïa"
            src="/assets/images/png/gaia.png"
            height={60}
            width={130}
          />
          <Image
            loading="lazy"
            className="u-color-scheme--dark"
            alt="Gaïa"
            src="/assets/images/png/gaia-blanc.png"
            height={60}
            width={130}
          />
        </a>
      </li>

      <li className={`c-partner--list-item`}>
        <a
          href="https://www.ocode.team/"
          title={`Ocode - ${lang.utils.newWindow}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            loading="lazy"
            className="u-color-scheme--light"
            alt="Ocode"
            src="/assets/images/png/ocode.png"
            height={60}
            width={95}
          />
          <Image
            loading="lazy"
            className="u-color-scheme--dark"
            alt="Ocode"
            src="/assets/images/png/ocode-blanc.png"
            height={60}
            width={95}
          />
        </a>
      </li>

      <li className={`c-partner--list-item`}>
        <a
          href="https://www.groupeonepoint.com/"
          title={`Onepoint - ${lang.utils.newWindow}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            loading="lazy"
            className="u-color-scheme--light"
            alt="Onepoint"
            src="/assets/images/png/onepoint.png"
            height={40}
            width={152}
          />
          <Image
            loading="lazy"
            className="u-color-scheme--dark"
            alt="Onepoint"
            src="/assets/images/png/onepoint-blanc.png"
            height={40}
            width={152}
          />
        </a>
      </li>

      <li className={`c-partner--list-item`}>
        <a
          href="https://incubateur.centrale-t4g-ensa.com/"
          title={`Incubateur Centrale-t4g-Ensa - ${lang.utils.newWindow}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            loading="lazy"
            className="u-color-scheme--light"
            alt="Incubateur Centrale-t4g-Ensa"
            src="/assets/images/png/incubateur.png"
            height={80}
            width={200}
          />
          <Image
            loading="lazy"
            className="u-color-scheme--dark"
            alt="Incubateur Centrale-t4g-Ensa"
            src="/assets/images/png/incubateur-blanc.png"
            height={80}
            width={200}
          />
        </a>
      </li>
    </ul>
  );
};

Partners.displayName = 'Partners';
