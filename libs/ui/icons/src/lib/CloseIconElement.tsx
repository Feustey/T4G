import React from "react";

interface IconProps {
  className?: string;
  size: "small" | "medium" | "large";
  variant?: "light" | "dark" | "extraDark";
}

export const CloseIconElement: React.FC<IconProps> = function ({
  className,
  size,
  variant = "light",
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-4 h-4";
  return (
    <span className={`inline-block ${dimensions}`}>
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="TFG_design"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
        fillOpacity="1"
      >
        <g
          id="STU_benefits_redeem"
          transform="translate(-1380.000000, -36.000000)"
          fill="currentColor"
        >
          <path
            d="M1403.46758,36.5506257 C1402.75768,35.8407281 1401.61092,35.8407281 1400.90102,36.5506257 L1392,45.4334471 L1383.09898,36.5324232 C1382.38908,35.8225256 1381.24232,35.8225256 1380.53242,36.5324232 C1379.82253,37.2423208 1379.82253,38.3890785 1380.53242,39.0989761 L1389.43345,48 L1380.53242,56.9010239 C1379.82253,57.6109215 1379.82253,58.7576792 1380.53242,59.4675768 C1381.24232,60.1774744 1382.38908,60.1774744 1383.09898,59.4675768 L1392,50.5665529 L1400.90102,59.4675768 C1401.61092,60.1774744 1402.75768,60.1774744 1403.46758,59.4675768 C1404.17747,58.7576792 1404.17747,57.6109215 1403.46758,56.9010239 L1394.56655,48 L1403.46758,39.0989761 C1404.15927,38.407281 1404.15927,37.2423208 1403.46758,36.5506257"
            id="Fill-1-Copy-2"
          />
        </g>
      </g>
    </svg>
    </span>
  );
};
