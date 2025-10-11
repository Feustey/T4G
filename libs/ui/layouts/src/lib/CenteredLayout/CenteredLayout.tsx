import { Layouts } from "@t4g/types";
import React from "react";

export const CenteredLayout: React.FC<Layouts.CenteredLayout.CenteredLayout.Props> =
  function ({
    className,
    children,
    BackgroundTopRegion,
    BackgroundRegion,
  }: Layouts.CenteredLayout.CenteredLayout.Props) {
    return (
      <div
        data-testid="CenteredLayout"
        className={`CenteredLayout ${className || ""} h-screen`}
      >
        <div className="BackgroundRegion lg:static relative h-full">
          {BackgroundRegion}
          {BackgroundTopRegion && (
            <div
              data-testid="BackgroundTopRegion"
              className="BackgroundTopRegion"
            >
              {BackgroundTopRegion}
            </div>
          )}

          <div
            data-testid="ContentRegion"
            className="CenteredContentRegion max-w-2xl md:mx-auto mx-4 flex flex-col justify-center"
          >
            {children}
          </div>
        </div>
      </div>
    );
  };
