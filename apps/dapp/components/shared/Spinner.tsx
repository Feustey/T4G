import Head from 'next/head';
import Image from 'next/image';
import { LangType, SizeType } from '../../types';

export interface ISpinner {
  lang: LangType;
  variant?: 'animation';
  size?: SizeType;
  spinnerText?: string;
}

export const Spinner: React.FC<ISpinner> = ({
  lang,
  variant,
  size = 'lg',
  spinnerText,
}) => {
  if (variant) {
    return (
      <>
        <Image
          className="c-spinner--animation"
          alt=""
          src="/assets/images/png/spinner-animation.png"
          height={100}
          width={100}
          priority
        />
      </>
    );
  } else {
    return (
      <>
        <Head>
          <title>{lang.utils.loading}</title>
        </Head>
        <div className={`c-spinner__container c-spinner__container--${size}`}>
          <Image
            className="c-spinner"
            alt={lang.utils.loading}
            src="/assets/images/png/spinner.png"
            height={100}
            width={100}
            priority
          />
          {spinnerText && (
            <p className="c-spinner--animation-text">{spinnerText}</p>
          )}
        </div>
      </>
    );
  }
};

Spinner.displayName = 'Spinner';
