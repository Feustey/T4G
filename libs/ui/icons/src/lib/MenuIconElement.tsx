import React from "react";

interface IconProps {
  className?: string;
  size: "small" | "medium" | "large";
}

export const MenuIconElement: React.FC<IconProps> = function ({
  className,
  size,
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-4 h-4";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={`MenuIconElement ${
        className || null
      } ${dimensions} inline stroke-current fill-current tw-text`}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6h16M4 12h8m-8 6h16"
      />
    </svg>
  );
};
