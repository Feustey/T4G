import { Fragment, useEffect, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";

export interface AutocompleteElementOptionProps<T> {
  label: string;
  labelDescription?: string;
  value: T;
  icon?: React.ReactNode;
}

export interface AutocompleteElementProps<T> {
  testid?: string;
  options: Array<AutocompleteElementOptionProps<T>>;
  label?: string;
  name: string;
  initialValue: AutocompleteElementOptionProps<T>;
  onChange?: any;
  className?: string;
  variant?: "dark" | "light";
  showError?: boolean;
}

const classNames = (...classes: string[]) => classes.filter(Boolean).join(" ");

export function AutocompleteElement<T>({
  label,
  options,
  testid,
  name,
  initialValue,
  onChange,
  className,
  variant,
  showError: showErrorProp,
}: AutocompleteElementProps<T>) {
  const [value, setValue] = useState<string>(`${initialValue.value}`);
  const [searchString, setSearchString] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(showErrorProp ?? false);

  const filteredOptions =
    searchString === ""
      ? options
      : options.filter((option) =>
          `${option.value}`.toLowerCase().includes(searchString.toLowerCase())
        );

  useEffect(() => {
    setShowError(showErrorProp as boolean);
  }, [showErrorProp]);

  const normalStateBorder =
    variant === "dark"
      ? "border-lm-gray dark:border-dm-white dark:border-opacity-12 "
      : "border-blue-003 dark:border-dm-white dark:border-opacity-12 ";
  const errorStateBorder = "border-lm-red dark:border-dm-red";

  return (
    <div
      className="AutocompleteElement relative"
      data-testid={`${testid || "AutocompleteElement"} ${className || ""}`}
    >
      <Combobox
        value={value}
        onChange={(payload: any) => {
          setShowError(false);
          setValue(`${payload.value}`);
          onChange(payload);
        }}
      >
        <Combobox.Button as="div">
          <Combobox.Input
            placeholder={label}
            name={name}
            onChange={(event) => setSearchString(event.target.value)}
            className={`form-control flex relative w-full border
          ${value!="" ? "tw-text" : "text-gray-400"}
                    ${showError ? errorStateBorder : normalStateBorder}
                    ${
                      variant === "dark"
                        ? "dark:bg-dm-darkestBlue shadow-sm"
                        : "dark:bg-dm-mediumDarkBlue"
                    }
                     pl-3 pr-10 py-2 text-left cursor-default focus:outline-none h-12 items-center`}
          />
        </Combobox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options
            static
            className={`AutocompleteElement__options absolute z-50 mt-1 w-full max-h-60  ring-1 ring-opacity-5 ring-lm-lightBlue border-lm-lightBlue dark:ring-dm-lightBlue dark:border-dm-lightBlue bg-white ${
              variant === "dark"
                ? "dark:bg-dm-darkestBlue shadow-lg"
                : "dark:bg-dm-mediumDarkBlue"
            } tw-text overflow-auto focus:outline-none tw-text-14`}
          >
            {filteredOptions.map((option, index: number) => (
              <Combobox.Option
                key={`${option.value}${index}`}
                value={option}
                className={({ active }) =>
                  classNames(
                    "SelectElement__option py-2.5",
                    active
                      ? "text-lm-lightBlue bg-lm-white dark:text-dm-lightBlue dark:bg-dm-lightBlue dark:bg-opacity-12"
                      : "text-gray-900 dark:text-gray-100",
                    "cursor-default select-none relative py-2 pl-3 pr-9"
                  )
                }
              >
                {option.label}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Transition>
      </Combobox>
    </div>
  );
}
