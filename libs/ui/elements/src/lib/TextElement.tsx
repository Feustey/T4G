import { Elements } from "@t4g/types";
import React from "react";

export const TextElement: React.FC<Elements.TextElement.Props> = ({
  as = "div",
  className = "",
  children,
  visible = true,
  color = "text-blue-002",
  variant = "default",
}: Elements.TextElement.Props) => {
  return (
    <>
      {variant === "default" &&
        visible &&
        React.createElement(
          as,
          { className: `inline-block ${className}` },
          children
        )}
      {variant === "link" && (
        <div className={`TextElement inline-block ${className}`}>
          <span className={`inline-block hover:underline text-base ${color}`}>
            {children}
          </span>
        </div>
      )}
    </>
  );
};
