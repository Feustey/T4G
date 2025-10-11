import Image from 'next/image';
import { LangType } from '../../types';

export interface INewsletter {
  lang: LangType;
}

export const Newsletter: React.FC<INewsletter> = ({ lang }) => {
  return (
    <section>
      <div className="e-container">
        <div className="c-newsletter">
          <h3>{lang.components.newsletter.title}</h3>
          <p>{lang.components.newsletter.desc}</p>
          <div className={`c-newsletter__buton-container`}>
            <div className={`o-media u-d-md--none`}>
              <Image
                loading="lazy"
                alt=""
                src="/assets/images/png/newsletter.png"
                className="c-newsletter__icon"
                width={80}
                height={77}
              />
            </div>
            <a
              href="https://tokenforgood.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`c-button--secondary c-button c-button--md`}
            >
              {lang.components.newsletter.cta}{' '}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

Newsletter.displayName = 'Newsletter';
