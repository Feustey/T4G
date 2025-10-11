import { CategoryType, LangType } from 'apps/dapp/types';
import Link from 'next/link';
import { Button, Icons, Tag } from '..';
import { useRouter } from 'next/router';

export interface ICategoryCard {
  categorie: CategoryType;
  type: 'SERVICE' | 'BENEFITS';
  key: number;
  lang: LangType;
}

export const CategoryCard: React.FC<ICategoryCard> = ({
  categorie,
  type,
  lang,
}) => {
  const router = useRouter();

  if (categorie?.disabled) {
    return (
      <div className={`c-categorie-card--${type.toLowerCase()}--disabled`}>
        <h2 className="u-d--flex u-align-items-center u-gap--s heading-3">
          <span
            className={`c-icon--title--${type.toLowerCase()} u-margin--none`}
          >
            {Icons[`${categorie?.icon}`]}
          </span>
          {categorie?.name}
          <Tag variant="soon" lang={lang} />
        </h2>
        <p>{categorie?.description}</p>
        <Button
          disabled
          theme="BENEFITS"
          variant="primary"
          label={'Discover'}
        />
      </div>
    );
  } else {
    return (
      <Link
        href={`/${type.toLowerCase()}/${encodeURIComponent(categorie.name)}`}
        className={`c-categorie-card--${type.toLowerCase()}`}
        passHref
      >
        <h2 className="u-d--flex u-align-items-center u-gap--s heading-3">
          <span
            className={`c-icon--title--${type.toLowerCase()} u-margin--none`}
          >
            {Icons[`${categorie?.icon}`]}
          </span>
          {categorie?.name}
        </h2>
        <p>{categorie?.description}</p>

        <Button
          label={'Discover'}
          theme="BENEFITS"
          variant="primary"
          onClick={(e) => {
            e.preventDefault();
            router.push(
              `/${type.toLowerCase()}/${encodeURIComponent(categorie.name)}`
            );
          }}
        />
      </Link>
    );
  }
};

CategoryCard.displayName = 'CategoryCard';
