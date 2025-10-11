import React, { HTMLAttributes } from 'react';
import { SizeType } from '../../types';

export interface ButtonGroupProps extends HTMLAttributes<HTMLUListElement> {
  size?: SizeType;
  placement?: 'center' | 'right' | 'left';
  inline?: boolean;
  reversed?: boolean;
  inlineBreakpoint?: SizeType;
  children: (JSX.Element | null)[];
  'data-cy'?: string;
}

function buildClasses(
  classes: (string | undefined | boolean)[],
  className = ''
) {
  return classes.filter((e) => Boolean(e)).join(' ') + className;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  size = 'md',
  placement,
  inline,
  reversed,
  inlineBreakpoint,
  children,
  className = '',
  ...props
}) => {
  const classes = buildClasses(
    [
      'c-button-group',
      inline && 'c-button-group--inline',
      inline &&
        inlineBreakpoint &&
        `c-button-group--inline-${inlineBreakpoint}`,
      placement && `c-button-group--${placement}`,
      placement === 'right' &&
        inline &&
        reversed &&
        'c-button-group--inline-reverse',
      size && `c-button-group--${size}`,
    ],
    className
  );

  const childrenToDisplay = children.filter((child) => child != null);
  return (
    <ul role="list" className={classes} {...props}>
      {childrenToDisplay.map((child) => (
        <li key={child.key}>{child}</li>
      ))}
    </ul>
  );
};
