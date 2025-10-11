import React from "react";

interface IconProps {
  size: "small" | "medium" | "large" | "default";
}

export const HelpIconElement: React.FC<IconProps> = function ({
  size = "default",
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-5 h-5";

  return (
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 20 20"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="TFG_design"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
        fillOpacity="0.12"
      >
        <g
          id="ALU_user_menu"
          transform="translate(-1375.000000, -498.000000)"
          fill="#2E384D"
        >
          <g id="Group-12" transform="translate(1083.000000, 112.000000)">
            <path
              d="M305.07,395.25 L304.17,396.17 C303.67,396.68 303.31,397.14 303.13,397.86 C303.05,398.18 303,398.54 303,399 L301,399 L301,398.5 C301,398.04 301.08,397.6 301.22,397.19 C301.42,396.61 301.75,396.09 302.17,395.67 L303.41,394.41 C303.87,393.97 304.09,393.31 303.96,392.61 C303.83,391.89 303.27,391.28 302.57,391.08 C301.46,390.77 300.43,391.4 300.1,392.35 C299.98,392.72 299.67,393 299.28,393 L298.98,393 C298.4,393 298,392.44 298.16,391.88 C298.59,390.41 299.84,389.29 301.39,389.05 C302.91,388.81 304.36,389.6 305.26,390.85 C306.44,392.48 306.09,394.23 305.07,395.25 L305.07,395.25 Z M301,403 L303,403 L303,401 L301,401 L301,403 Z M302,386 C296.48,386 292,390.48 292,396 C292,401.52 296.48,406 302,406 C307.52,406 312,401.52 312,396 C312,390.48 307.52,386 302,386 L302,386 Z"
              id="Fill-1"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};
