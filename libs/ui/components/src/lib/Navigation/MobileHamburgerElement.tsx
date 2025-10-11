import { Components } from "@t4g/types";
import { GridIconElement } from "@t4g/ui/icons";
import React from "react";

export const MobileHamburgerElement: React.FC<
  Components.Navigation.MobileHamburger.Props
> = ({
  onMobileHamburgerClick,
  showMobileHamburger = true,
}: Components.Navigation.MobileHamburger.Props): JSX.Element => {
  return (
    <button
      type="button"
      className={`MobileHamburgerElement focus:outline-none lg:hidden `}
      onClick={() => onMobileHamburgerClick(true)}
    >
      {showMobileHamburger ? (
        <div className="flex">
          <span className="sr-only text-red-500 bg-gray-400">Open sidebar</span>
          <span className="text-blue-005">
            <GridIconElement size="medium" aria-hidden="true" />
          </span>
          <span className="text-blue-006 ml-1"></span>
        </div>
      ) : (
        <></>
      )}
    </button>
  );
};
