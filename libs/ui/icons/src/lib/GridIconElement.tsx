import React from "react";

interface IconProps {
  size: "small" | "medium" | "large" | "default";
}

export const GridIconElement: React.FC<IconProps> = function ({
  size = "default",
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-5 h-5";

  return (
    <svg
      width="30px"
      height="32px"
      viewBox="0 0 30 32"
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
          id="ALU_dashboard_mobile"
          transform="translate(-274.000000, -24.000000)"
          fill="#2E384D"
        >
          <g id="Group-14" transform="translate(274.000000, 24.000000)">
            <path
              d="M2.25011384,28 C1.00733476,28 0,28.8953634 0,30 C0,31.1043985 1.00733476,32 2.25011384,32 L27.7498862,32 C28.9926652,32 30,31.1046366 30,30 C30,28.8953634 28.9926652,28 27.7498862,28 L2.25011384,28 Z"
              id="Path"
            ></path>
            <path
              d="M2.25011384,14 C1.00733476,14 0,14.8953634 0,16 C0,17.1043985 1.00733476,18 2.25011384,18 L27.7498862,18 C28.9926652,18 30,17.1046366 30,16 C30,14.8953634 28.9926652,14 27.7498862,14 L2.25011384,14 Z"
              id="Path"
            ></path>
            <path
              d="M2.25011384,0 C1.00733476,0 0,0.895363371 0,2 C0,3.10439855 1.00733476,4 2.25011384,4 L27.7498862,4 C28.9926652,4 30,3.10463663 30,2 C30,0.895363371 28.9926652,0 27.7498862,0 L2.25011384,0 Z"
              id="Path"
            ></path>
          </g>
        </g>
      </g>
    </svg>
  );
};
