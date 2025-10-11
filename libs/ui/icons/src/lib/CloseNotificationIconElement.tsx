import React from "react";

interface IconProps {
  className?: string;
  size: "small" | "medium" | "large";
  variant?: "light" | "dark" | "extraDark";
}

export const CloseNotificationIconElement: React.FC<IconProps> = function ({
  className,
  size,
  variant = "light",
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-4 h-4";
  return (
    <svg
      width="12px"
      height="12px"
      viewBox="0 0 12 12"
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
          id="STU_benefits_processing"
          transform="translate(-1117.000000, -45.000000)"
          fill="#2F6F5E"
        >
          <path
            d="M1129.8925,45.3025 C1129.5025,44.9125 1128.8725,44.9125 1128.4825,45.3025 L1123.5925,50.1825 L1118.7025,45.2925 C1118.3125,44.9025 1117.6825,44.9025 1117.2925,45.2925 C1116.9025,45.6825 1116.9025,46.3125 1117.2925,46.7025 L1122.1825,51.5925 L1117.2925,56.4825 C1116.9025,56.8725 1116.9025,57.5025 1117.2925,57.8925 C1117.6825,58.2825 1118.3125,58.2825 1118.7025,57.8925 L1123.5925,53.0025 L1128.4825,57.8925 C1128.8725,58.2825 1129.5025,58.2825 1129.8925,57.8925 C1130.2825,57.5025 1130.2825,56.8725 1129.8925,56.4825 L1125.0025,51.5925 L1129.8925,46.7025 C1130.2725,46.3225 1130.2725,45.6825 1129.8925,45.3025"
            id="Fill-1"
          />
        </g>
      </g>
    </svg>
  );
};
