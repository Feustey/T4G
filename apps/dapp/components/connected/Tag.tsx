import { LangType } from 'apps/dapp/types';
import { Icons } from '..';

export interface ITag {
  label?: string;
  canRemove?: boolean;
  lang: LangType;
  handleRemove?: () => void;
  variant?: 'soon';
}

export const Tag: React.FC<ITag> = ({
  label,
  canRemove,
  lang,
  handleRemove,
  variant,
}) => {
  if (variant === 'soon') {
    return <span className="c-tag--soon">{lang.utils.soon}</span>;
  } else {
    return (
      <div className="c-tag" onClick={handleRemove}>
        <p>{label}</p>
        {canRemove && (
          <button type="button" className="c-tag__remove-button">
            {Icons.close} <span className="u-sr-only">{lang.utils.delete}</span>{' '}
          </button>
        )}
      </div>
    );
  }
};

Tag.displayName = 'Tag';
