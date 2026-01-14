import { Layouts } from "@t4g/types";
import {
  MobileHamburgerElement,
  Navigation,
  ProfileDropdownMenu,
  ProfileToggleRegion,
} from "@t4g/ui/components";
import {
  ButtonElement,
  LogoElement,
  ToasterElement,
} from "@t4g/ui/elements";
import { TFGTokenIconElement } from "@t4g/ui/icons";
import { DropdownLayout } from "@t4g/ui/layouts";
import { useAppContext } from "@t4g/ui/providers";
import { useRouter } from "next/router";
import React from "react";
import { OverlayNotificationLayout } from "../NotificationLayout/OverlayNotificationLayout";
import { useAuth } from '@/contexts/AuthContext';
import useSwr from "swr";
import { SessionType } from "apps/dapp/types";

export const TopBar: React.FC<Layouts.AppLayout.TopBar.Props> = ({
  onMobileHamburgerClick,
  showMobileHamburger = true,
  scrollBarWidth,
  setNotificationPosition,
  notificationPosition,
}: Layouts.AppLayout.TopBar.Props) => {
  const router = useRouter();
  const { notification, navigationItems, toaster } = useAppContext();

  const session = useSession().data as SessionType;
  const user = session!.user;

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: wallet } = useSwr(`/api/users/me/wallet`, fetcher); //TODO error

  const topBarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timerHandle = setTimeout(() => {
      setNotificationPosition(
        topBarRef.current?.offsetLeft && topBarRef.current?.offsetLeft - 220
      );
    }, 0);
    return () => clearTimeout(timerHandle);
  }, []);

  return (
    <>
      <div
        className={`TopBar z-1 flex relative z-50 justify-between items-center w-full px-3 lg:px-10 py-3 h-72 border-b border-blue-003 bg-white`}
        data-testid="TopBar"
        style={{ zIndex: 1 }}
      >
        <div className="flex">
          <div className="TopBar__logo">
            <LogoElement variant="t4g" />
          </div>
          {user && (
            <div className="TopBar__DesktopMenu hidden lg:block ml-[74px]">
              <Navigation
                items={
                  router.route.startsWith("/admin/") ||
                  user.role == "SERVICE_PROVIDER"
                    ? navigationItems.filter(
                        (item: any) => item.menu === "admin"
                      )
                    : navigationItems
                        .filter((item: any) => item.menu === "app")
                        .filter((item: any) =>
                          user.role === "STUDENT" && item.link === "/services"
                            ? false
                            : true
                        )
                }
                variant="horizontal"
              />
            </div>
          )}
        </div>

        <div
          ref={topBarRef}
          className="TopBar__ProfileDropdown flex items-center h-48"
        >
          {wallet && user && (
            <ButtonElement
              variant={{
                hover: "hover:bg-orange-001",
                text: "text-orange-002",
                border: "border border-orange-002",
                height: "h-40 lg:h-48",
              }}
              onClick={() => {
                user?.role === "SERVICE_PROVIDER"
                  ? router.push("/admin/wallet")
                  : router.push("/wallet");
              }}
              icon={<TFGTokenIconElement size="small" />}
            >
              {wallet.balance}
            </ButtonElement>
          )}

          <DropdownLayout
            className="ProfileDropdownLayout lg:block z-0 hidden ml-8"
            ToggleRegion={<ProfileToggleRegion />}
            align="right"
          >
            <ProfileDropdownMenu user={user} />
          </DropdownLayout>

          <div className="TopBar__Mobile lg:hidden z-30 flex items-center justify-between w-full">
            <DropdownLayout
              className="ProfileDropdownLayout mx-4 mt-3"
              ToggleRegion={<ProfileToggleRegion variant="mobile" />}
              align="right"
            >
              <ProfileDropdownMenu user={user} />
            </DropdownLayout>
            <MobileHamburgerElement
              onMobileHamburgerClick={onMobileHamburgerClick}
              showMobileHamburger={showMobileHamburger}
            />
          </div>
        </div>
      </div>

      {notification && (
        <div className="NotificationRegion lg:absolute top-6 lg:top-4 relative z-50 flex justify-center w-full">
          <div className="w-full">
            <OverlayNotificationLayout
              className="text-base"
              position={notificationPosition}
            />
          </div>
        </div>
      )}

      {toaster && (
        <div
          className="ToasterRegion relative"
          style={{
            zIndex: 600,
            right: 0,
            top: 17,
            width: `calc(100vw - ${scrollBarWidth}px)`,
          }}
        >
          <div>
            <ToasterElement className="text-base" timer={10000} />
          </div>
        </div>
      )}
    </>
  );
};
