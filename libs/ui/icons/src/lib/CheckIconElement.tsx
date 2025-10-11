import React from "react";

interface IconProps {
  className?: string;
  size: "small" | "medium" | "large";
  checked?: boolean;
  fill?: string;
}

export const CheckIconElement: React.FC<IconProps> = function ({
  className,
  size,
  checked,
  fill = "#31C27A",
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-4 h-4";

  return (
    <span className={`inline-block ${dimensions}`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 7L5.5 11L15.5 1" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
};
