import React, { HTMLAttributes } from 'react';
import { Icons, IconsT4G } from './Icons';
import { LangType } from 'apps/dapp/types';

export interface ITextInput extends HTMLAttributes<HTMLInputElement> {
  id: string;
  labelText?: string;
  helperText?: string;
  placeholder?: string;
  hasIcon?: boolean;
  iconName?: keyof IconsT4G;
  valid?: boolean;
  isErrored?: boolean;
  errorText?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  onIconClick?: React.MouseEventHandler;
  labelClassName?: string;
  containerClassName?: string;
  labelProps?: React.ComponentPropsWithoutRef<'label'>;
  inputProps?: React.ComponentPropsWithoutRef<'input'>;
  langFile?: LangType;
  value?: string;
  pattern?: string;
  handleChange: (value: string) => void;
}

export const TextInput: React.FC<ITextInput> = ({
  labelText,
  labelClassName,
  containerClassName,
  isDisabled = false,
  isRequired = false,
  isErrored = false,
  errorText,
  id,
  placeholder,
  helperText,
  hasIcon,
  iconName,
  labelProps,
  langFile,
  inputProps,
  value,
  pattern,
  handleChange,
}) => {
  return (
    <>
      <div className={containerClassName || ``}>
        {labelText && (
          <label className={labelClassName || ``} htmlFor={id} {...labelProps}>
            {labelText}
            {isRequired && langFile ? (
              <>
                <span aria-hidden={true}>*</span>
                <span className="u-sr-only">{langFile.utils.required}</span>
              </>
            ) : null}
          </label>
        )}
        <input
          className={`form-control ${isErrored ? 'has-error' : ''}`}
          id={id}
          type={`text`}
          required={isRequired}
          placeholder={placeholder}
          disabled={isDisabled}
          aria-invalid={(isErrored && !isDisabled) || undefined}
          pattern={pattern}
          {...inputProps}
          value={value || ''}
          aria-describedby={
            (helperText && errorText && `${id}-helper-text ${id}-error-text`) ||
            (helperText && `${id}-helper-text`) ||
            (errorText && `${id}-error-text`) ||
            undefined
          }
          onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
            handleChange(e.target.value);
          }}
        />
        {hasIcon && iconName ? Icons[iconName] : null}
        {helperText && (
          <p id={`${id}-helper-text`} className={`helper-text`}>
            {helperText}
          </p>
        )}
        {errorText && (
          <p id={`${id}-error-text`} className={`error-text`}>
            {errorText}
          </p>
        )}
      </div>
    </>
  );
};

const MemoTextInput = React.memo(TextInput);

TextInput.displayName = 'TextInput';

export default MemoTextInput;
