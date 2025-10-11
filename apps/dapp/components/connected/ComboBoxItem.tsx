import * as React from 'react';
import { Icons, IconsT4G } from '../index';

export interface IDropdownItem
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange'> {
  hasicon?: boolean;
  iconName?: keyof IconsT4G;
  hasIcon?: boolean;
  divider?: boolean;
  children?: React.ReactNode;
  onChange?: (event: React.ChangeEvent) => void;
  isSelected?: boolean;
}

export const DropdownItem = ({
  divider = false,
  hasIcon = false,
  iconName,
  children,
  onChange,
  isSelected = false,
  ...props
}: IDropdownItem) => {
  const [selected, setSelected] = React.useState(isSelected);

  return (
    <React.Fragment>
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) =>
          setSelected(() => {
            if (onChange) {
              onChange(e);
            }
            return !selected;
          })
        }
        {...props}
      />
      <label htmlFor={props['id'] ?? undefined}>
        {hasIcon ? Icons[iconName] : null}
        {children}
        {selected ? <span>selected</span> : null}
      </label>
      {divider ? <hr /> : null}
    </React.Fragment>
  );
};

const MemoDropdownItem = React.memo(DropdownItem);

MemoDropdownItem.displayName = 'DropdownItem';

export default MemoDropdownItem;
