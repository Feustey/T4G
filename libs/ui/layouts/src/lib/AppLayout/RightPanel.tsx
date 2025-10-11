import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { useAppContext } from "@t4g/ui/providers";
import { CloseIconElement } from "@t4g/ui/icons";

export const RightPanel = () => {
  const { rightPanel, setRightPanel } = useAppContext();

  const onCloseRightPanel = () => {
    setRightPanel(null);
  };

  return (
    <Transition.Root show={Boolean(rightPanel)} as="div">
      <Dialog
        as="div"
        static
        className="fixed inset-0 overflow-hidden"
        style={{ zIndex: 9999 }}
        open={Boolean(rightPanel)}
        onClose={onCloseRightPanel}
      >
        <div className="absolute top-[72px] left-0 right-0 bottom-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-blue-009 bg-opacity-60 transition-opacity" />
          </Transition.Child>

          <div className="fixed top-[72px] bottom-0 right-0 pl-10 flex sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="RightPanelRegion w-screen lg:w-[50vw]">
                <div className="h-full flex flex-col p-9 bg-white shadow-xl scrollbar overflow-y-auto overflow-x-hidden">
                  <div className="flex items-start justify-end">
                    <button
                      className="bg-white focus:outline-none focus:ring-transparent"
                      onClick={onCloseRightPanel}
                    >
                      <span className="sr-only">Close panel</span>
                      <span className="text-blue-008 hover:text-blue-007">
                        <CloseIconElement size="small" />
                      </span>
                    </button>
                  </div>

                  <div className="relative">
                    {rightPanel && (
                      <div className="RightPanelRegion__content">
                        {rightPanel.component}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
