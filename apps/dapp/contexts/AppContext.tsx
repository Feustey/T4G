import React, { useContext, useState, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/router";
import { LocaleType, UserType } from "../types";

export type INotification = {
  title: string;
  description?: string;
  pollingCallback?: any;
  messageList: Array<{ label: string; value: string; wrap?: boolean }>;
  link?: string;
  type: "warning" | "error" | "success" | "spin";
} | null;

export type IModal = {
  name?: string;
  component?: React.ReactNode;
} | null;

export type IRightPanel = {
  component?: React.ReactNode;
} | null;

export interface IAppContext {
  updateDisabled: boolean;
  editUserProfile: (user: UserType) => void;
  deleteUserProfile: (user: UserType) => void;
  notification?: INotification;
  toaster?: INotification;
  modal?: IModal;
  rightPanel?: IRightPanel;
  navigationItems: Array<{
    title: string;
    link: string;
    menu: "app" | "web" | "admin";
    external?: boolean;
  }>;
  setNotification: Dispatch<SetStateAction<INotification | undefined>>;
  setToaster: Dispatch<SetStateAction<INotification | undefined>>;
  setModal: Dispatch<SetStateAction<IModal | undefined>>;
  setRightPanel: Dispatch<SetStateAction<IRightPanel | undefined>>;
  setUpdateDisabled: Dispatch<SetStateAction<boolean>>;
}

export const AppContext = React.createContext<IAppContext | undefined>(
  undefined
);

export interface AppContextProps {
  children?: React.ReactNode;
}

export function AppContextProvider({ children }: AppContextProps) {
  const [notification, setNotification] = useState<INotification>();
  const [toaster, setToaster] = useState<INotification>();
  const [modal, setModal] = useState<IModal>();
  const [rightPanel, setRightPanel] = useState<IRightPanel>();
  const [updateDisabled, setUpdateDisabled] = React.useState(false);
  const router = useRouter();
  const locale = router.locale as LocaleType;

  const navigationItems: IAppContext["navigationItems"] = [
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
