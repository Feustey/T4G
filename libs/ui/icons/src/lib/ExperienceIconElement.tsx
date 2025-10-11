import React from "react";

interface IconProps {
  className?: string;
  size: "small" | "medium" | "large";
  checked?: boolean;
  checkIconColor?: "green";
}

export const ExperienceIconElement: React.FC<IconProps> = function ({
  className,
  size,
  checked,
  checkIconColor,
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-5 h-5" : size === "large" ? "w-8 h-8" : "w-4 h-4";

  return (
    <svg
      width="20px"
      height="19px"
      viewBox="0 0 20 19"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="TFG_design"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
        fillOpacity="0.5"
      >
        <g
          id="STU_benefits_redeem"
          transform="translate(-778.000000, -709.000000)"
          fill="currentColor"
        >
          <g id="Group-20" transform="translate(778.000000, 629.000000)">
            <g id="Group-19" transform="translate(0.000000, 80.000000)">
              <path
                d="M17,17 L3,17 C2.45,17 2,16.55 2,16 L2,11.331 L8,11.331 L8,13.331 L12.036,13.331 L12.036,11.331 L18,11.331 L18,16 C18,16.55 17.55,17 17,17 L17,17 Z M3,6 L17,6 C17.55,6 18,6.45 18,7 L18,9.331 L2,9.331 L2,7 C2,6.45 2.45,6 3,6 L3,6 Z M8,4 L12,4 L12,2 L8,2 L8,4 Z M18,4 L14,4 L14,2 C14,0.89 13.11,0 12,0 L8,0 C6.89,0 6,0.89 6,2 L6,4 L2,4 C0.89,4 0.01,4.89 0.01,6 L0,17 C0,18.11 0.89,19 2,19 L18,19 C19.11,19 20,18.11 20,17 L20,6 C20,4.89 19.11,4 18,4 L18,4 Z"
                id="Fill-1"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
