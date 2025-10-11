import React, { useState } from "react";
import { useAppContext } from "@t4g/ui/providers";
import { ButtonElement } from "@t4g/ui/elements";
import { Layouts } from "@t4g/types";

export const DialogLayout: React.FC<Layouts.DialogLayout.DialogLayout.Props> =
  function ({
    title,
    children,
    disableConfirm = false,
    showSpinner = false,
    onConfirm,
    confirmButtonLabel,
  }: Layouts.DialogLayout.DialogLayout.Props) {
    const { setModal } = useAppContext();
    const [confirmed, setConfirmed] = useState<boolean>(false);
    const handleConfirm = () => {
      setConfirmed(true);
      onConfirm();
    };

    return (
      <>
        <div className="mt-5">
          <h3
            className="DialogLayout__title md:text-2xl text-center text-lg font-medium tw-text"
            id="modal-title"
          >
            {title}
          </h3>

          <div className="DialogLayout__content mt-7.5">
            <div className="text-base tw-text">{children}</div>
          </div>
        </div>
        <div className="DialogLayout__control mt-7.5 sm:flex sm:flex-row-reverse">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-2.5">
            <ButtonElement
              variant={{
                hover: "bg-orange-001",
                text: "text-orange-002",
                border: "border border-orange-002",
                height: "h-40 lg:h-48",
              }}
              onClick={() => setModal(null)}
            >
              Cancel
            </ButtonElement>
            <ButtonElement
              variant={{
                hover: "bg-orange-001",
                text: "text-orange-002",
                border: "border border-orange-002",
                height: "h-40 lg:h-48",
              }}
              onClick={() => handleConfirm()}
            >
              {confirmButtonLabel ?? "Confirm"}
            </ButtonElement>
          </div>
        </div>
      </>
    );
  };
