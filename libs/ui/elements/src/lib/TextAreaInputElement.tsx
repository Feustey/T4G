import { Elements } from "@t4g/types";
import { ErrorExclamationIconElement } from "@t4g/ui/icons";
import React, { useEffect, useState } from "react";

export const TextAreaInputElement: React.FC<
  Elements.TextAreaInputElement.Props
> = ({
  testid,
  rows = 5,
  name,
  label,
  placeholder,
  initialValue,
  description,
  onChange,
  onBlur,
  errorMessage,
  disabled,
  value,
  visible = true,
  className,
  descriptionPosition = "rightOfLabel",
  showError: showErrorProp,
}: Elements.TextAreaInputElement.Props) => {
  const [showError, setShowError] = useState(showErrorProp ?? false);
  console.log(value);
  useEffect(() => {
    if (errorMessage || showErrorProp) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [errorMessage, showErrorProp]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setShowError(false);
    onChange?.(e);
  };

  const handleBlur = (e: any) => {
    onBlur?.(e);
  };
  if (!visible) return null;
  return (
    <div
      className={`TextInputElement w-full ${className || ""}`}
      data-testid="TextInputElement"
    >
      <div className="flex items-center">
        <label
          htmlFor={name}
          className="TextInputElement__label text-blue-005 block"
        >
          {label}
        </label>
        {description && descriptionPosition === "rightOfLabel" && (
          <div className="tw-text text-base ml-2.5">{description}</div>
        )}
      </div>
      {description && descriptionPosition === "bottomOfLabel" && (
        <div className="tw-text text-base mb-2.5 mt-1">{description}</div>
      )}
      <div className="relative mt-2">
        <textarea
          name={name}
          id={name}
          rows={rows}
          cols={5}
          data-testid={testid || ""}
          placeholder={placeholder}
          value={value}
          defaultValue={initialValue}
          autoComplete={name}
          disabled={disabled}
          className={`form-control--textarea`}
          aria-describedby="email-error"
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <textarea value={value} onChange={handleChange}></textarea>

        {showError && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ErrorExclamationIconElement size="small" />
          </div>
        )}
      </div>
      {showError && (
        <div
          data-testid="TextInputElement__error"
          className="TextInputElement__error text-lm-red dark:text-dm-red pt-2 text-base"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};
