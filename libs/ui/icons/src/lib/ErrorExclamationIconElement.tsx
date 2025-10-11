import React from "react";

interface IconProps {
  className?: string;
  size: "small" | "medium" | "large";
  fill?: string;
}

export const ErrorExclamationIconElement: React.FC<IconProps> = function ({
  className,
  size,
  fill = "#FC100D",
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-4 h-4";

  return (
    <span className={`inline-block ${dimensions}`}>
      <svg
        width="24px"
        height="24px"
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
        >
          <g
            id="ALU_onboarding_5_wallet"
            transform="translate(-482.000000, -555.000000)"
            fill={fill}
          >
            <g id="Group-6" transform="translate(314.000000, 535.000000)">
              <g id="Group-7" transform="translate(168.000000, 20.000000)">
                <path
                  d="M10.8,18 L13.2,18 L13.2,15.6 L10.8,15.6 L10.8,18 Z M12,21.6 C6.696,21.6 2.4,17.304 2.4,12 C2.4,6.696 6.696,2.4 12,2.4 C17.304,2.4 21.6,6.696 21.6,12 C21.6,17.304 17.304,21.6 12,21.6 L12,21.6 Z M11.988,0 C5.364,0 0,5.376 0,12 C0,18.624 5.364,24 11.988,24 C18.624,24 24,18.624 24,12 C24,5.376 18.624,0 11.988,0 L11.988,0 Z M12,6 C12.66,6 13.2,6.54 13.2,7.2 L13.2,12 C13.2,12.66 12.66,13.2 12,13.2 C11.34,13.2 10.8,12.66 10.8,12 L10.8,7.2 C10.8,6.54 11.34,6 12,6 L12,6 Z"
                  id="Fill-1"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </span>
  );
};
