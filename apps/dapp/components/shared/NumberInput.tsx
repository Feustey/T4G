import React, { HTMLAttributes, useState } from 'react';
import { Icons, IconsT4G } from './Icons';
import { LangType } from 'apps/dapp/types';

export interface INumberInput extends HTMLAttributes<HTMLInputElement> {
  id: string;
  labelText?: string;
  helperText?: string;
  placeholder?: string;
  hasIcon?: boolean;
  iconName?: keyof IconsT4G;
  valid?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  onIconClick?: React.MouseEventHandler;
  labelClassName?: string;
  containerClassName?: string;
  labelProps?: React.ComponentPropsWithoutRef<'label'>;
  inputProps?: React.ComponentPropsWithoutRef<'input'>;
  langFile?: LangType;
  value?: number;
  minValue: number;
  maxValue: number;
  pattern?: string;
  handleChange: (value: number) => void;
}

export const NumberInput: React.FC<INumberInput> = ({
  labelText,
  labelClassName,
  containerClassName,
  isDisabled = false,
  isRequired = false,
  id,
  placeholder,
  helperText,
  hasIcon,
  iconName,
  labelProps,
  langFile,
  inputProps,
  value,
  minValue,
  maxValue,
  pattern,
  handleChange,
}) => {
  const [isErrored, setIsErrored] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>(undefined);

  function handleInputNumberErrors(value: number) {
    if (value > maxValue) {
      setIsErrored(true);
      setErrorText(`Valeur supérieure à la valeur max (${maxValue})`);
    } else if (value < minValue) {
      setIsErrored(true);
      setErrorText(`Valeur inférieure à la valeur min (${minValue})`);
    } else {
      setIsErrored(false);
      setErrorText(undefined);
    }
  }

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
          className={`form-control`}
          id={id}
          type={`number ${isErrored ? 'has-error' : ''}`}
          required={isRequired}
          min={minValue}
          max={maxValue}
          placeholder={placeholder}
          disabled={isDisabled}
          aria-invalid={(isErrored && !isDisabled) || undefined}
          pattern={pattern}
          {...inputProps}
          value={value || undefined}
          aria-describedby={
            (helperText && errorText && `${id}-helper-text ${id}-error-text`) ||
            (helperText && `${id}-helper-text`) ||
            (errorText && `${id}-error-text`) ||
            undefined
          }
          onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
            handleChange(Number(e.target.value));
            handleInputNumberErrors(Number(e.target.value));
          }}
        />
        {hasIcon && iconName ? Icons[iconName] : null}
        {helperText && (
          <p id={`${id}-helper-text`} className={``}>
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

const MemoNumberInput = React.memo(NumberInput);

NumberInput.displayName = 'NumberInput';

export default MemoNumberInput;
