import React from "react";

export interface ButtonElementProps {
  children?: React.ReactNode;
  variant?: {
    text?: string;
    border?: string;
    height?: string;
    disabled?: string;
    active?: string;
    hover?: string;
    width?: string;
    margin?: string;
  };
  onClick?: () => void;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
}

export const ButtonElement: React.FC<ButtonElementProps> = ({
  children,
  variant = {
    text: "text-orange-002",
    border: "border border-orange-002",
    height: "h-40 lg:h-48",
    disabled: "bg-green-001 text-white",
    active: "bg-green-001 text-white",
    hover: "hover:",
  },
  onClick,
  icon,
  iconPosition = "left",
  disabled,
}) => {
  return (
    <div
      className={`ButtonElement ${
        disabled || (variant?.hover && variant?.hover.includes("shadow-none"))
          ? ""
          : "hover:"
      } ${variant.width ?? ""} ${variant?.margin ?? ""}`}
    >
      <button className="w-full" onClick={onClick} disabled={disabled}>
        <span
          className={`flex items-center justify-center w-full px-5 font-medium transition-colors duration-300 ${
            disabled ? variant.disabled : variant.active
          } ${variant.text} ${variant.border} ${
            disabled ? "" : variant.hover
          } ${variant.height}`}
        >
          {icon && iconPosition === "left" && (
            <span className="flex items-center mr-2">{icon}</span>
          )}
          {children}
          {iconPosition === "right" && (
            <span className="flex items-center ml-2">{icon}</span>
          )}
        </span>
      </button>
    </div>
  );
};
