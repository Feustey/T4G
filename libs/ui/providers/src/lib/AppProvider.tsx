import { Providers } from "@t4g/types";
import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import { LocaleType, UserType } from "@shared/types";

export const AppContext = React.createContext<
  Providers.AppProvider.IAppContext | undefined
>(undefined);

export function AppContextProvider({
  children,
}: Providers.AppProvider.AppContextProps) {
  const [notification, setNotification] =
    useState<Providers.AppProvider.INotification>();
  const [toaster, setToaster] = useState<Providers.AppProvider.INotification>();
  const [modal, setModal] = useState<Providers.AppProvider.IModal>();
  const [rightPanel, setRightPanel] =
    useState<Providers.AppProvider.IRightPanel>();
  const [updateDisabled, setUpdateDisabled] = React.useState(false);
  const router = useRouter();
  const locale = router.locale as LocaleType;

  const navigationItems: Providers.AppProvider.IAppContext["navigationItems"] =
    [
      { title: "Dashboard", link: "/dashboard", menu: "app" },
      { title: "Benefits", link: "/benefits", menu: "app" },
      { title: "Services", link: "/services", menu: "app" },
      { title: "Community", link: "/community", menu: "app" },
      {
        title: "Help",
        link: `https://token-for-good.com/help/${locale}/`,
        menu: "app",
        external: true,
      },
      { title: "Students", link: "/students", menu: "web" },
      { title: "Alumni", link: "/alumni", menu: "web" },
      {
        title: "Alumni redeems",
        link: "/admin/service-delivery",
        menu: "admin",
      },
      {
        title: "Alumni catalogue",
        link: "/admin/service-catalogue",
        menu: "admin",
      },
      {
        title: "Dashboard",
        link: "/admin/dashboard",
        menu: "admin",
      },
    ];

  return (
    <AppContext.Provider
      value={{
        // user,
        navigationItems,
        notification,
        toaster,
        modal,
        rightPanel,
        updateDisabled,
        setUpdateDisabled,
        setNotification,
        setToaster,
        setModal,
        setRightPanel,
        // setUser,
        editUserProfile: (user: UserType) => console.log("update user"),
        deleteUserProfile: (user: UserType) => console.log("delete user"),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error(
      "You must use AppProvider in order to consume this context"
    );
  }
  return context;
}
