import React from "react";

export interface DividerElementProps {
  bleeding?: boolean;
  spacing?: string;
}

export const DividerElement: React.FC<DividerElementProps> = ({
  bleeding = false,
  spacing = "py-0",
}) => {
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
