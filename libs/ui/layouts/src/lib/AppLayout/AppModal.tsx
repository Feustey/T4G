import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { useAppContext } from "@t4g/ui/providers";
import { CloseIconElement } from "@t4g/ui/icons";

export const AppModal = () => {
  const { modal, setModal } = useAppContext();
  const [openModal, setOpenModal] = useState<boolean>(false);

  useEffect(() => {
    setOpenModal(!!modal);
  }, [modal]);

  return (
    <Transition.Root show={!!openModal} as={Fragment}>
      <Dialog
        as="div"
        style={{ zIndex: 9999 }}
        static
        className="AppLayout__Modal fixed inset-0 overflow-y-auto"
        open={!!openModal}
        onClose={() => {
          setOpenModal(false);
          setTimeout(() => setModal(null), 300);
        }}
      >
        <div className="flex items-end justify-center min-h-screen lg:pt-4 lg:px-4 lg:pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-blue-009 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={`AppLayoutModal__contents inline-block align-bottom bg-white w-full h-full lg:w-auto lg:h-auto text-left overflow-hidden shadow-xl transform transition-all lg:my-8 sm:align-middle ${
                modal?.widthClass ? modal.widthClass : ""
              }`}
            >
              <div className="absolute top-0 right-0 pt-7 pr-7">
                <button
                  className="bg-white focus:outline-none focus:ring-transpare text-blue-008 "
                  onClick={(value) => {
                    setOpenModal(false);
                    setTimeout(() => setModal(null), 300);
                  }}
                >
                  <span className="sr-only">Close</span>
                  <CloseIconElement size="small" />
                </button>
              </div>
              <div>{modal?.component}</div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
