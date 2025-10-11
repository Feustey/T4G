import React from "react";

interface IconProps {
  color: string;
  size: "small" | "medium" | "large";
}

export const ChevronDownIconElement: React.FC<IconProps> = function ({
  size,
  color = "black",
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-5 h-5";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className={`ChevronDownloadIconElement ${dimensions} inline fill-current ${color}`}
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
};
