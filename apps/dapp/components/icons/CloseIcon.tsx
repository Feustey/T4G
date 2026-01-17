import React from "react";

interface CloseIconProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export const CloseIcon: React.FC<CloseIconProps> = ({ size = "medium", className = "" }) => {
  const sizeMap = {
    small: "w-5 h-5",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
};
