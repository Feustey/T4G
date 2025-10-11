import { Elements } from "@t4g/types";
import React from "react";

export const DividerElement: React.FC<Elements.DividerElement.Props> =
  function ({
    bleeding = false,
    spacing = "py-0",
  }: Elements.DividerElement.Props) {
    return (
      <div
        className={`DividerElement relative ${spacing} ${
          bleeding ? "" : "mx-2"
        }`}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-blue-003" />
        </div>
      </div>
    );
  };
