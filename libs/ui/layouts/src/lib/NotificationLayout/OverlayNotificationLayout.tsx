import { Elements } from "@t4g/types";
import {
  DividerElement,
  TextElement,
  TextIconElement,
} from "@t4g/ui/elements";
import {
  ArrowIconElement,
  ChevronDownIconElement,
  SpinnerIconElement,
} from "@t4g/ui/icons";
import { DropdownLayout } from "@t4g/ui/layouts";
import { useAppContext } from "@t4g/ui/providers";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

export const OverlayNotificationLayout: React.FC<
  Elements.OverlayNotificationElement.Props
> = ({ timer = 5000, position }: Elements.OverlayNotificationElement.Props) => {
  const { notification, setNotification, toaster, setToaster } =
    useAppContext();
  const router = useRouter();
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = "1";
    }

    let timerHandle: any;

    if (notification?.pollingCallback) {
      const intervalHandle = setInterval(async () => {
        await notification?.pollingCallback(intervalHandle);
      }, 1000);
    } else {
      timerHandle = setTimeout(() => {
        if (ref.current) {
          ref.current.style.opacity = "0";
          setTimeout(() => {
            setNotification(null);
          }, 1000);
        }
      }, timer);
    }

    return () => {
      clearTimeout(timerHandle);
    };
  }, [timer, notification]);

  const backgroundColors: Record<
    "warning" | "error" | "success" | "spin",
    string
  > = {
    error: "bg-green-002",
    success: "bg-green-001",
    spin: "bg-green-001",
    warning: "bg-green-001",
  };

  if (notification?.messageList) {
    return (
      <div
        ref={ref}
        aria-live="assertive"
        className="OverlayNotificationElement absolute flex lg:items-end pointer-events-none opacity-0 transition transform-opacity duration-1000"
        style={{
          left: Number(window.innerWidth > 1024 && position),
          top: -6,
        }}
      >
        <div className="flex flex-col items-start lg:items-end px-[4vw] lg:px-0 -ml-1 lg:ml-0">
          <div
            className={`min-w-[92vw] lg:min-w-[1vw] ${
              backgroundColors[notification.type]
            }  pointer-events-auto`}
          >
            <div className="">
              <DropdownLayout
                className="ProfileDropdownLayout z-0"
                ToggleRegion={
                  <div>
                    <div className="flex items-center px-4 py-2.5">
                      <SpinnerIconElement size="small" variant="light" />

                      <TextIconElement
                        icon={
                          <ChevronDownIconElement
                            size="medium"
                            color="text-blue-008"
                          />
                        }
                        iconPosition="right"
                      >
                        <span className="inline-block text-left text-white text-lg pl-3 pr-6">
                          Pending
                        </span>
                      </TextIconElement>
                    </div>
                  </div>
                }
                align="right"
              >
                <div className="flex flex-col w-80 p-4 bg-green-001  text-base text-white">
                  <div className="">Transaction</div>
                  <ul role="list" className="flex flex-col mt-2.5">
                    {notification.messageList.map((message) => (
                      <li key={message.value} className="flex flex-col">
                        <div className="flex items-start">
                          <div className="min-w-[50px] text-gray-040">
                            {message.label}
                          </div>
                          <div
                            className={message.wrap ? "flex-wrap" : "truncate"}
                          >
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
              </DropdownLayout>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};
