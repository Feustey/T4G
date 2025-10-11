import * as React from 'react';
import { DropdownItem } from '../index';

export interface IDropdown
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  isErrored?: boolean;
  errorText?: string;
  labelText?: string;
  summary?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  onChange?: (value: string) => void;
}

export const Dropdown = ({
  labelText = undefined,
  summary = 'Dropdown',
  disabled = false,
  className = '',
  style,
  children,
  onChange,
  ...props
}: IDropdown) => {
  return (
    <div
      className={`dropdown ${className}`}
      aria-disabled={disabled}
      style={style}
    >
      {labelText && <label htmlFor={props['id']}>{labelText}</label>}
      <details open={disabled ? false : undefined}>
        <summary aria-labelledby={props['id']}>{summary}</summary>
        <div
          className="dropdown_items"
          role="group"
          aria-labelledby={props['id']}
        >
          {/**
           * Renders every child and inject onChange in DropdownItem
           */}
          {React.Children.map(children, (child: React.ReactNode) =>
            React.isValidElement(child) && child.type === DropdownItem
              ? React.cloneElement(child, {
                  ...child.props,
                  onChange: (ev: React.ChangeEvent<HTMLDivElement>) => {
                    onChange && onChange(child.props.value);
                    child.props.onChange && child.props.onChange(ev);
                  },
                })
              : child
          )}
        </div>
      </details>
    </div>
  );
};

const MemoDropdown = React.memo(Dropdown);

MemoDropdown.displayName = 'Dropdown';

export default MemoDropdown;
