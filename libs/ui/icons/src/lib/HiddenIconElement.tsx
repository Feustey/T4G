import React from "react";

interface IconProps {
  className?: string;
  size: "small" | "medium" | "large";
  checked?: boolean;
  checkIconColor?: "green";
}

export const HiddenIconElement: React.FC<IconProps> = function ({
  className,
  size,
  checked,
  checkIconColor,
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-4 h-4";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="16" viewBox="0 0 22 16" fill="none">
      <path d="M14 8C14 9.65685 12.6569 11 11 11C9.34315 11 8 9.65685 8 8C8 6.34315 9.34315 5 11 5C12.6569 5 14 6.34315 14 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.45825 7.99997C2.73253 3.94288 6.52281 1 11.0004 1C15.4781 1 19.2684 3.94291 20.5426 8.00004C19.2684 12.0571 15.4781 15 11.0005 15C6.52281 15 2.73251 12.0571 1.45825 7.99997Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
