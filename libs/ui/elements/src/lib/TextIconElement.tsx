import { Elements } from "@t4g/types";
import React from "react";

export const TextIconElement: React.FC<Elements.TextIconElement.Props> = ({
  icon,
  children,
  iconPosition = "left",
}: Elements.TextIconElement.Props) => {
  return (
    <div className="TextIconElement flex justify-between">
      <div
        data-testid="TextIconElement"
        className={`TextIconElement  flex items-center`}
      />
      <span className="inline-block whitespace-nowrap">
        {iconPosition === "left" && <span>{icon}</span>}
        <div className="inline-block">{children}</div>
        {iconPosition === "right" && <span>{icon}</span>}
      </span>
    </div>
  );
};
