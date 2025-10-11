import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Layouts } from "@t4g/types";

export const DropdownLayout: React.FC<Layouts.DropdownLayout.DropdownLayout.Props> =
  function ({
    className,
    ToggleRegion,
    children,
    align,
    variant = {
      contentRegion: "mt-1 lg:mt-4",
      component: "z-0 hidden lg:block ml-8",
    },
    setToggleState,
  }: Layouts.DropdownLayout.DropdownLayout.Props) {
    const contentAlign = align === "left" ? "left-0" : "right-0";

    return (
      <div
        className={`DropdownLayout flex items-center ${className}`}
        data-testid="DropdownLayout"
      >
        <Menu as="div" className="relative inline-block text-left z-10 w-full">
          {({ open }) => (
            <>
              <div
                className="DropdownLayout__ToggleRegion"
                data-testid="DropdownLayout__ToggleRegion"
              >
                <Menu.Button className="inline-flex justify-center w-full bg-transparent focus:outline-none">
                  <div onClick={() => setToggleState && setToggleState(!open)}>
                    {ToggleRegion}
                  </div>
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-75"
                enterFrom="transform opacity-0 scale-75"
                enterTo="transform opacity-100 scale-250"
                leave="transition ease-in duration-25"
                leaveFrom="transform opacity-100 scale-250"
                leaveTo="transform opacity-0 scale-75"
              >
                <div className="DropdownLayout__ContentRegion ">
                  <Menu.Items
                    unmount
                    className={`DropdownLayout__Content bg-white origin-top-right absolute ${contentAlign} ${variant.contentRegion}  shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none`}
                  >
                    {children}
                  </Menu.Items>
                </div>
              </Transition>
            </>
          )}
        </Menu>
      </div>
    );
  };
