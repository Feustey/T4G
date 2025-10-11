import React from "react";

interface IconProps {
  className?: string;
  size: "small" | "medium" | "large";
  variant?: "light" | "dark" | "extraDark";
}

export const BackIconElement: React.FC<IconProps> = function ({
  className,
  size,
  variant = "light",
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-4 h-4";
  return (
    <svg
      width="16px"
      height="16px"
      viewBox="0 0 16 16"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="TFG_design"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
        fillOpacity="0.6"
      >
        <g
          id="STU_benefits_detail"
          transform="translate(-36.000000, -145.000000)"
          fill="currentColor"
        >
          <path
            d="M50.5825,151.5925 L39.4125,151.5925 L44.2925,146.7125 C44.6825,146.3225 44.6825,145.6825 44.2925,145.2925 C43.9025,144.9025 43.2725,144.9025 42.8825,145.2925 L36.2925,151.8825 C35.9025,152.2725 35.9025,152.9025 36.2925,153.2925 L42.8825,159.8825 C43.2725,160.2725 43.9025,160.2725 44.2925,159.8825 C44.6825,159.4925 44.6825,158.8625 44.2925,158.4725 L39.4125,153.5925 L50.5825,153.5925 C51.1325,153.5925 51.5825,153.1425 51.5825,152.5925 C51.5825,152.0425 51.1325,151.5925 50.5825,151.5925"
            id="Fill-1"
          />
        </g>
      </g>
    </svg>
  );
};
