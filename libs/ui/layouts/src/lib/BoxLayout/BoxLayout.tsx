import { Layouts } from "@t4g/types";
import React from "react";

export const BoxLayout: React.FC<Layouts.BoxLayout.BoxLayout.Props> =
  function ({
    className,
    contentClassName,
    children,
    TopRegion,
    HeaderRegion,
    variant,
    headerClassName,
    style,
  }: Layouts.BoxLayout.BoxLayout.Props) {
    return (
      <div
        data-testid="BoxLayout"
        className={`BoxLayout ${
          variant === "tile"
            ? "BoxLayout__tile lg:px-5 lg:py-3.75 p-4 tw-bg tw-tile-shadow"
            : variant === "card"
            ? "BoxLayout__card"
            : variant === "no-shadow"
            ? "p-2 bg-white dark:bg-dm-darkestBlue"
            : "BoxLayout__box p-2 bg-white dark:bg-dm-darkestBlue"
        }  ${className}`}
      >
        {variant === "tile" ? (
          <div
            data-testid="ContentRegion"
            className={`ContentRegion ${contentClassName}`}
          >
            {children}
          </div>
        ) : (
          <div>
            {TopRegion && (
              <div data-testid="TopRegion" className="TopRegion">
                {TopRegion}
              </div>
            )}
            <div
              className={`BoxLayout__content ${
                style?.["BoxLayout__content"]
                  ? style["BoxLayout__content"]
                  : `sm:p-10 py-4 px-2`
              }`}
            >
              {HeaderRegion && (
                <div
                  data-testid="HeaderRegion"
                  className={`HeaderRegion ${headerClassName}`}
                >
                  {HeaderRegion}
                </div>
              )}
              <div
                data-testid="ContentRegion"
                className={`ContentRegion ${contentClassName}`}
              >
                {children}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
