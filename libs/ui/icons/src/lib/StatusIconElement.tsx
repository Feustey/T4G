import React from "react";
import {
  CheckIconElement,
  ErrorExclamationIconElement,
  SpinnerIconElement,
} from "@t4g/ui/icons";

interface IconProps {
  className?: string;
  size: "small" | "medium" | "large";
  checked?: boolean;
  checkIconColor?: "green";
  status: "ERROR" | "PENDING" | "SUCCESS";
  variant?: "white" | "default";
}

export const StatusIconElement: React.FC<IconProps> = function ({
  size,
  status,
  variant = "default",
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-6 h-6" : size === "large" ? "w-8 h-8" : "w-4 h-4";

  return (
    <span className={`inline-block ${dimensions}`}>
      {status === "SUCCESS" && (
        <CheckIconElement
          size={size}
          fill={variant === "white" ? "#FFFFFF" : "#31C27A"}
        />
      )}
      {status === "PENDING" && <SpinnerIconElement size={size} />}
      {status === "ERROR" && (
        <ErrorExclamationIconElement
          size={size}
          fill={variant === "white" ? "#FFFFFF" : "#31C27A"}
        />
      )}
    </span>
  );
};
