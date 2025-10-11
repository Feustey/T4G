import { Icons, IconsT4G } from '../index';

export interface IListContentItem {
  value: string;
  text: string;
}
export interface IList {
  listContent: IListContentItem[];
  iconStart?: keyof IconsT4G;
  id: string;
  hasMainvalue?: boolean;
}

export const List: React.FC<IList> = ({
  listContent,
  iconStart,
  hasMainvalue = false,
}) => {
  return (
    <ul role="list" className="c-list">
      {listContent.map((listContentItem, index) => {
        return (
          <li
            key={index}
            className={`c-list__item${iconStart ? '--icon-start' : ''}`}
          >
            {iconStart && Icons[iconStart]}{' '}
            {hasMainvalue ? (
              <p className="u-margin-b--none">
                <span className="c-list__main-value">
                  {listContentItem.value}
                </span>
                {listContentItem.text}
              </p>
            ) : (
              <p className="u-margin-b--none">{listContentItem.text}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
};

List.displayName = 'List';
