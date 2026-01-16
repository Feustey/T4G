import React from "react";

export interface SelectElementProps {
  inline?: boolean;
  zIndex?: string;
  listHeight?: string;
  label?: string;
  value?: string;
  options?: Array<{ label: string; value: string }>;
  variant?: "default" | "theme";
  status?: "default" | "error" | "success";
  handleChange?: (value: string) => void;
}

export const SelectElement = ({
  label,
  value,
  options = [],
  handleChange,
}: SelectElementProps): JSX.Element => {
  return (
    <select
      value={value || ""}
      onChange={(e) => handleChange?.(e.target.value)}
      className="w-full px-3 py-2 border border-blue-003 rounded text-base text-blue-005"
    >
      {label && <option value="">{label}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
