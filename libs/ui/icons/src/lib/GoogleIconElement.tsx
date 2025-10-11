import React from "react";

interface IconProps {
  className?: string;
  size: "small" | "medium" | "large";
}

export const GoogleIconElement: React.FC<IconProps> = function ({
  className,
  size,
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-4 h-4";

  return (
    <img
      className={`GoogleIconElement ${
        className || null
      } ${dimensions} inline rounded-full fill-current dark:text-dm-white`}
      src="/assets/icons/google-icon.svg"
      alt="google"
    />
  );
};
