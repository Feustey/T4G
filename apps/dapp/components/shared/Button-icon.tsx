import React, { HTMLAttributes } from 'react';
import { VariantType, ButtonType, SizeType } from '../../types';

import { Icons, IconsT4G } from './Icons';

export interface ButtonIconProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: VariantType;
  size?: SizeType;
  iconName: keyof IconsT4G;
  iconEnd?: keyof IconsT4G;
  accessibilityLabel?: string;
  disabled?: boolean;
  title?: string;
  type?: ButtonType;
  unfocusable?: boolean;
  innerRef?: React.ForwardedRef<HTMLButtonElement>;
  'data-cy'?: string;
}

export const ButtonIcon: React.FC<ButtonIconProps> = React.forwardRef(
  (
    {
      size = 'md',
      variant = 'primary',
      iconName,
      accessibilityLabel,
      type = 'button',
      innerRef,
      className = '',
      unfocusable = false,
      ...props
    }: ButtonIconProps,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <button
        ref={innerRef || ref}
        type={type}
        tabIndex={unfocusable ? -1 : null}
        className={`
                c-button
                c-button--${size}
                c-button--${variant}
                c-button-${iconName}
                ${iconName ? 'c-button-icon-only' : ''}
                ${className}`}
        {...props}
      >
        {iconName && Icons[iconName]}
        {accessibilityLabel && (
          <span className="u-sr-only">{accessibilityLabel}</span>
        )}
      </button>
    );
  }
);

ButtonIcon.displayName = 'ButtonIcon';
