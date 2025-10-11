import { ButtonElement } from "@t4g/ui/elements";
import { useAppContext } from "@t4g/ui/providers";
import { signOut } from "next-auth/react";
import React from "react";
import Cookies from "cookies";

type SignOutDialogProps = Record<string, unknown>;

export const SignOutDialog = () => {
  const { setModal } = useAppContext();
  return (
    <div className="DeleteServiceModal  flex flex-col items-start justify-center w-full p-8 bg-white ">
      <h2>You are about to leave Token For Good</h2>
      <div className="w-full mt-12">
        <div className="text-blue-005 text-h3 text-center"></div>

        <div className="flex items-center w-full">
          <div className="EditProgram__Controls flex justify-end w-full">
            <div>
              <ButtonElement
                onClick={() => {
                  setModal(null);
                }}
                variant={{
                  hover: "",
                  text: "font-semibold text-base text-blue-008",
                  border: "border border-blue-003",
                  height: "h-40 lg:h-48",
                  active: "bg-white",
                }}
              >
                CANCEL
              </ButtonElement>
            </div>
            <div className="ml-4">
              <ButtonElement
                onClick={async () => {
                  setModal(null);
                  await signOut({
                    callbackUrl: "https://login.t4g.com/logout",
                  });

                  window.location.pathname = "/";
                }}
                variant={{
                  disabled: "bg-white text-blue-008 border border-blue-003",
                  hover: "",
                  text: "text-base",
                  border: "",
                  height: "h-40 lg:h-48",
                  active: "border border-green-001 bg-green-001 text-white",
                }}
              >
                YES SIGN OUT
              </ButtonElement>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
