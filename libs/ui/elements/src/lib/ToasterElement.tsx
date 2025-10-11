import { Elements } from "@t4g/types";
import {
  ArrowIconElement,
  CheckIconElement,
  CloseNotificationIconElement,
  ErrorCrossIconElement,
  SpinnerIconElement,
  WarningIconElement,
} from "@t4g/ui/icons";
import { useAppContext } from "@t4g/ui/providers";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { DividerElement } from "./DividerElement";
import { TextElement } from "./TextElement";

export const ToasterElement: React.FC<Elements.ToasterElement.Props> = ({
  timer = 5000,
}: Elements.ToasterElement.Props) => {
  const { toaster, setToaster } = useAppContext();
  const router = useRouter();
  const toasterRef = React.useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const timerHandle = setTimeout(() => {
      setToaster(null);
    }, timer);

    return () => {
      clearTimeout(timerHandle);
    };
  }, [timer]);

  React.useEffect(() => {
    if (toasterRef.current) {
      toasterRef.current.style.transform = "translateX(0px)";
      setTimeout(() => {
        if (toasterRef.current) {
          toasterRef.current.style.transform = "translateX(340px)";
        }
      }, timer);
    }
  }, []);

  const ToasterColor = {
    error: "bg-red-001",
    success: "bg-green-001",
    spin: "bg-green-001",
    warning: "bg-orange-002",
  };

  const ToasterIcon = {
    success: <CheckIconElement size="medium" checked fill="#ffffff" />,
    spin: <SpinnerIconElement size="medium" />,
    warning: <WarningIconElement size="medium" />,
    error: <ErrorCrossIconElement size="medium" />,
  };
  const ToasterType = {
    success: "Success",
    spin: "Pending",
    warning: "Warning",
    error: "Fail",
  };

  if (toaster?.messageList) {
    return (
      <div
        ref={toasterRef}
        aria-live="assertive"
        className="ToasterElement absolute flex right-0 transition-transform duration-300 translate-x-[340px]"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          <div
            className={`flex flex-col w-80 p-4 rounded-l-lg text-base text-white ${
              ToasterColor[toaster.type]
            } `}
          >
            <div className="flex justify-between items-center">
              <div className="ToasterElement__Icon flex items-center">
                {ToasterIcon[toaster.type]}
                <h3 className="ml-2.5 font-medium text-h3">
                  {ToasterType[toaster.type]}
                </h3>
              </div>
              <div className="ToasterElement__Close ml-4 self-start -mt-1 mr-1">
                <button
                  className=""
                  onClick={() => {
                    if (toasterRef.current) {
                      toasterRef.current.style.transform = "translateX(340px)";
                    }
                  }}
                >
                  <span className="sr-only">Close</span>
                  <CloseNotificationIconElement size="small" />
                </button>
              </div>
            </div>

            <div className="mt-5">{toaster.title}</div>
            <ul role="list" className="flex flex-col mt-2.5">
              {toaster.messageList.map((message) => (
                <li key={message.value} className="flex flex-col">
                  <div className="flex items-start">
                    <div className="min-w-[50px] text-gray-040">
                      {message.label}
                    </div>
                    <div className={message.wrap ? "flex-wrap" : "truncate"}>
                      {message.value}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <DividerElement bleeding spacing="pt-10" />
            <div
              className="flex items-center cursor-pointer -mt-1 mb-1"
              onClick={() => router.push("/wallet")}
            >
              <TextElement
                className="lg:inline-block"
                variant="link"
                color="text-white"
              >
                View in wallet
              </TextElement>
              <span className="ml-2">
                <ArrowIconElement size="small" color="#ffffff" />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};
