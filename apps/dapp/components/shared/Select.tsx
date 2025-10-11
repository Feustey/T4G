import React, { HTMLAttributes, useRef } from 'react';
import { IconsT4G } from './Icons';
import { LangType } from '@shared/types';

export interface ISelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface ISelect extends HTMLAttributes<HTMLSelectElement> {
  isDisabled?: boolean;
  isErrored?: boolean;
  errorText?: string;
  id: string;
  labelText: string;
  hasIcon?: boolean;
  iconName?: keyof IconsT4G;
  options: ISelectOption[];
  isValid?: boolean;
  labelClassName?: string;
  containerClassName: string;
  value?: ISelectOption['value'];
  isRequired?: boolean;
  lang?: LangType;
  isSmallable?: boolean;
  ariaDescribedby?: string;
  handleOptionChange: (option: ISelectOption['value']) => void;
}

export const Select: React.FC<ISelect> = ({
  isErrored,
  errorText,
  id,
  labelText,
  options,
  labelClassName,
  containerClassName,
  isRequired = false,
  lang,
  value,
  ariaDescribedby,
  isSmallable,
  handleOptionChange,
}) => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const errorTextId = `error-text-${id}`;
  return (
    <div className={containerClassName}>
      <label className={labelClassName || ''} htmlFor={id}>
        {labelText}
        {isRequired && lang ? (
          <>
            <span aria-hidden={true}>*</span>
            <span className="u-sr-only">{lang.utils.required}</span>
          </>
        ) : null}
      </label>
      <select
        id={id}
        className={`form-select ${
          isSmallable ? 'form-select--smallable' : null
        }  ${isErrored ? 'has-error' : null}`}
        aria-describedby={
          isErrored && errorText
            ? errorTextId
            : isErrored && ariaDescribedby
            ? ariaDescribedby
            : null
        }
        ref={selectRef}
        required={isRequired}
        value={value ? value : options[0].value}
        onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
          if (e.target.value !== '') {
            handleOptionChange(e.target.value);
          }
        }}
      >
        {options.map((option: ISelectOption, index) => {
          return (
            <option
              key={index}
              value={option.value}
              disabled={option.disabled}
              hidden={option.disabled}
            >
              {option.label}
            </option>
          );
        })}
      </select>

      {isErrored && errorText && (
        <p id={errorTextId} className="-select_error-text">
          {errorText}
        </p>
      )}
    </div>
  );
};

Select.displayName = 'Select';
