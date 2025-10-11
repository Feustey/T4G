import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { CloseIconElement } from "@t4g/ui/icons";
import { MobileSidebarNavigation } from "./MobileSidebarNavigation";
import { Components } from "@t4g/types";

export const MobileNavigation = ({
  showMobileSidebarNavigation,
  setShowMobileSidebarNavigation,
}: Components.Navigation.MobileNavigation.Props): JSX.Element => {
  return (
    <Transition.Root show={showMobileSidebarNavigation} as={Fragment}>
      <Dialog
        as="div"
        static
        className="MobileNavigation fixed inset-0 flex lg:hidden"
        open={showMobileSidebarNavigation}
        onClose={setShowMobileSidebarNavigation}
        style={{ zIndex: 9999 }}
      >
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="transition ease-in-out duration-300 transform"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div className="MobileNavigation__overlay flex-1 flex flex-col max-w-xs w-full">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-1000"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="MobileNavigation__close absolute top-0 right-6 pt-2 ">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-full rounded-full focus:outline-none "
                  onClick={() => setShowMobileSidebarNavigation(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <CloseIconElement
                    size="small"
                    className="w-6 h-6"
                    variant="light"
                  />
                </button>
              </div>
            </Transition.Child>
            <div className="MobileNavigation__content overflow-y-auto h-full absolute">
              <MobileSidebarNavigation />
            </div>
          </div>
        </Transition.Child>
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Dummy element to force sidebar to shrink to fit close icon */}
        </div>
      </Dialog>
    </Transition.Root>
  );
};
