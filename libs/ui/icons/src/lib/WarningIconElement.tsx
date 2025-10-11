import React from "react";

interface IconProps {
  className?: string;
  size: "small" | "medium" | "large";
}

export const WarningIconElement: React.FC<IconProps> = function ({
  className,
  size,
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-4 h-4";
  /*
  The SVG has been displayed using an img tag, hence we cannot toggle the color in light and dark mode as of now.
  */
  return (
    <img
      className={`WarningIconElement ${
        className || null
      } ${dimensions} inline rounded-full fill-current dark:text-dm-white`}
      src="/assets/icons/warning.svg"
      alt="warning"
    />
  );
};
