import React, { HTMLAttributes } from 'react';
import { VariantType, ButtonType, SizeType } from '../../types';

import { Icons, IconsT4G } from './Icons';
import { Spinner } from '../index';
import { LangType } from '../../lib/shared-types';

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: VariantType;
  size?: SizeType;
  label: string;
  iconStart?: keyof IconsT4G;
  iconEnd?: keyof IconsT4G;
  type?: ButtonType;
  className?: string;
  innerRef?: React.ForwardedRef<HTMLButtonElement>;
  'data-cy'?: string;
  disabled?: boolean;
  isLoading?: boolean;
  lang?: LangType;
  tag?: number | string;
  theme?: 'SERVICES' | 'BENEFITS';
}

export const Button: React.FC<ButtonProps> = React.forwardRef(
  (
    {
      size = 'md',
      variant = 'default',
      iconStart,
      iconEnd,
      label,
      type = 'button',
      innerRef,
      className = '',
      disabled = false,
      isLoading = false,
      lang,
      theme,
      tag,
      ...props
    }: ButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <button
        ref={innerRef || ref}
        disabled={disabled}
        type={type}
        className={`
                c-button
                c-button--${size}
                c-button--${variant}${theme ? `--${theme.toLowerCase()}` : ''}
                ${iconStart ? 'c-button--icon-start' : ''}
                ${iconEnd ? 'c-button--icon-end' : ''}
                ${className}`}
        {...props}
      >
        {isLoading ? (
          <Spinner lang={lang} size={'sm'} />
        ) : (
          <>
            {iconStart && Icons[iconStart]}
            {label}
            {tag && <span className="c-button__tag">{tag}</span>}
            {iconEnd && Icons[iconEnd]}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
