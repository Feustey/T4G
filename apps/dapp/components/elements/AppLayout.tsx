import React from "react";

type AppLayoutProps = {
  children?: React.ReactNode;
  user?: any;
  showSidebar?: boolean;
  showTopBar?: boolean;
  userBalance?: number;
};

export const AppLayout = ({
  children,
}: AppLayoutProps) => {
  return (
    <div className="AppLayout h-full w-full bg-opacity-50 overflow-x-hidden">
      <div className="AppLayout__Outline relative flex flex-col w-full h-full">
        <div className="AppLayout__Content h-4/5 lg:bg-contain flex flex-grow w-full bg-no-repeat bg-cover">
          <main className="AppLayout__Main scrollbar w-full h-full overflow-x-hidden overflow-y-auto">
            <div className="AppLayout__Children lg:px-9 lg:py-7 lg:mt-0 w-full px-3 py-2">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
