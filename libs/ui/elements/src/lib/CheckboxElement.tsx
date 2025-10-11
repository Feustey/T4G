import React from "react";
import { Elements } from "@t4g/types";

export const CheckboxElement: React.FC<Elements.CheckboxElement.Props> =
  function ({
    name,
    label,
    checked,
    className,
    onClick,
    onChange,
  }: Elements.CheckboxElement.Props) {
    return (
      <div className={`CheckboxElement ${className || ""}`} onClick={onClick}>
        <input
          id={name}
          name={name}
          type="checkbox"
          className=""
          checked={checked}
          onChange={onChange}
        />
        <label
          htmlFor={name}
          className="CheckboxElement__label text-base ml-2 text-blue-005"
        >
          {label}
        </label>
      </div>
    );
  };
