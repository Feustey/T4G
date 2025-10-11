import React from "react";
import { AppModal } from "./AppModal";
import { MobileNavigation } from "@t4g/ui/components";
import { RightPanel } from "./RightPanel";
import { TopBar } from "./TopBar";

type AppLayoutProps = {
  children?: React.ReactNode;
  showSidebar?: boolean;
  showTopBar?: boolean;
  user?: any;
  userBalance?: number;
};

export const AppLayout = ({
  user,
  children,
  showSidebar = true,
  showTopBar = true,
  userBalance,
}: AppLayoutProps) => {
  const [showMobileSidebarNavigation, setShowMobileSidebarNavigation] =
    React.useState(false);
  const [scrollBarWidth, setScrollBarWidth] = React.useState(0);
  const [notificationPosition, setNotificationPosition] = React.useState(0);

  const mainRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  if (mainRef.current?.scrollTop) {
    mainRef.current.scrollTop = 0;
  }
  // React.useEffect(() => {
  //   setUser(user);
  //   if (mainRef.current && contentRef.current) {
  //     setScrollBarWidth(
  //       mainRef.current.offsetWidth - contentRef.current.clientWidth
  //     );
  //   }
  // }, []);

  return (
    <div
      className={`AppLayout h-full w-full bg-opacity-50 overflow-x-hidden`}
      data-testid="AppLayout"
    >
      <MobileNavigation
        showMobileSidebarNavigation={showMobileSidebarNavigation}
        setShowMobileSidebarNavigation={setShowMobileSidebarNavigation}
      />
      <div className="AppLayout__Outline  relative flex flex-col w-full h-full">
        {showTopBar && user?.role === "SERVICE_PROVIDER" && (
          <TopBar
            onMobileHamburgerClick={setShowMobileSidebarNavigation}
            showMobileHamburger={showSidebar}
            scrollBarWidth={scrollBarWidth}
            setNotificationPosition={setNotificationPosition}
            notificationPosition={notificationPosition}
            userBalance={userBalance}
          />
        )}

        {/* css class to set img backgrund bg-watermark-mobile md:bg-watermark-desktop */}
        <div className="AppLayout__Content h-4/5 lg:bg-contain  flex flex-grow w-full bg-no-repeat bg-cover">
          <main
            ref={mainRef}
            className="AppLayout__Main scrollbar w-full h-full overflow-x-hidden overflow-y-auto"
          >
            <div
              ref={contentRef}
              className="AppLayout__Children lg:px-9 lg:py-7 lg:mt-0 w-full px-3 py-2"
            >
              {children}
            </div>
          </main>
        </div>
      </div>

      <RightPanel />
      <AppModal />
    </div>
  );
};
