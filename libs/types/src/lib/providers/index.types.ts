import { Dispatch, SetStateAction } from "react";
import { UserType } from "@shared/types";

export namespace AppProvider {
  export interface IAppContext {
    // user: {
    //   firstname: string;
    //   lastname: string;
    //   email: string;
    //   wallet: {
    //     balance: number;
    //   };
    // };
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
    // setUser: Dispatch<SetStateAction<any>>;
    setUpdateDisabled: Dispatch<SetStateAction<boolean>>;
    // sendNotification: (data: {
    //   payload: Record<string, any>;
    //   type: string;
    // }) => void;
  }

  export interface AppContextProps {
    children?: React.ReactNode;
  }

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
    onConfirm?: () => void;
    confirmButtonLabel?: string;
    cancelButtonLabel?: string;
    widthClass?: string;
  } | null;

  export type IRightPanel = {
    component: React.ReactNode;
  } | null;
}

export namespace AuthProvider {
  export type UserFieldsFragment = {
    id?: string;
    email: string;
    lastname: string;
    firstname: string;
    loading: "authenticated" | "loading" | "unauthenticated";
    role?: string;
    wallet?: any;
    avatar?: string;
  };
}
