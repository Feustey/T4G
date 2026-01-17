import { Auth } from "@t4g/types";
import * as React from "react";
import { ReactNode } from "react";
import { UserType } from "@shared/types";

export namespace AppLayout {
  export namespace AppLayout {
    export interface Props {
      children?: ReactNode;
      showSidebar?: boolean;
      showTopBar?: boolean;
    }
  }

  export namespace ProfileToggleRegion {
    export interface Props {
      variant?: "mobile" | "default";
    }
  }

  export namespace TopBar {
    export interface Props {
      className?: string;
      onMobileHamburgerClick: React.Dispatch<boolean>;
      showMobileHamburger?: boolean;
      scrollBarWidth?: number;
      setNotificationPosition?: any;
      notificationPosition?: number;
      userBalance?: number;
    }
  }

  export namespace UserProfile {
    export interface Props {
      onEditProfile: (user: UserType) => void;
      onDeleteProfile: (user: UserType) => void;
    }
  }
}

export namespace BoxLayout {
  export namespace BoxLayout {
    export interface Props {
      className?: string;
      contentClassName?: string;
      children: ReactNode;
      TopRegion?: ReactNode;
      HeaderRegion?: ReactNode;
      variant?: "tile" | "card" | "no-shadow";
      headerClassName?: string;
      style?: Record<string, string>;
    }
  }
}

export namespace CenteredLayout {
  export namespace CenteredLayout {
    export interface Props {
      children: ReactNode;
      className?: string;
      BackgroundRegion?: ReactNode;
      BackgroundTopRegion?: ReactNode;
    }
  }
}

export namespace DialogLayout {
  export namespace DialogLayout {
    export interface Props {
      onConfirm: () => void;
      title: string;
      children: React.ReactElement;
      showInput?: boolean;
      disableConfirm?: boolean;
      showSpinner?: boolean;
      confirmButtonLabel?: string;
    }
  }
}

export namespace DropdownLayout {
  export namespace DropdownLayout {
    export interface Props {
      className?: string;
      ToggleRegion: ReactNode;
      children: ReactNode;
      align: "left" | "right";
      variant?: { contentRegion: string; component: string };
      setToggleState?: (isOpen: boolean) => void;
    }
  }
}
