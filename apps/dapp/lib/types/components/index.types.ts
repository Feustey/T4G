import { Dispatch, ReactElement, SetStateAction } from "react";
import { Entities } from "../types";
import { Notification, ServiceCategory } from "../../stubs/service-data-types";
import { Api } from "../types";
import { Service } from "../api/index.types";
import { LangType } from "../../../types/shared";

/**
 * Types Variables
 */
export type ServiceCategoryName =
  | "Mentoring"
  | "Guest lecturer"
  | "Jury member"
  | "Jury"
  | "Student buddy"
  | "Campus activity"
  | "Language courses"
  | "Certification programs"
  | "Executive education"
  | "Professional coaching"
  | "Recruitment visibility"
  | "Conferences & events"
  | "Knowledge & expertise"
  | "Alumni recognition"
  | "Buddy services"
  | "Campus activities";

export type UserRole = "ALUMNI" | "STUDENT" | "SERVICE_PROVIDER";
export type Audience = "STUDENT" | "ALUMNI";
export type TransactionCode =
  | "WELCOME_BONUS_RECEIVED" // [Student, Alumni] Tokens in: x
  | "SERVICE_PROVIDED" // [Alumni] Services: Mentoring session confirmed - Tokens in: x
  | "SERVICE_BOOKED_BY_STUDENT" // [Student] Benefits - Redeemed - Mentoring - Tokens out: x
  | "SERVICE_BOOKED_BY_ALUMNI" // [Alumni] Services: Mentoring booking received
  | "SERVICE_DELIVERY_CANCELED_BY_STUDENT" // [Student] Benefits - Mentoring booking canceled - Tokens in: x // [Alumni] Services: Mentoring booking canceled
  | "SERVICE_DELIVERY_CONFIRMED_BY_STUDENT" // [Student] Benefits - Mentoring session confirmed
  | "SERVICE_REDEEMED_BY_ALUMNI" // [Alumni] Benefits: Redeemed - Benefit category - Benefit name - Tokens out: x
  | "SERVICE_DELIVERY_CONFIRMED_BY_SERVICE_PROVIDER" // [Admin] Benefits: Confirmed - Benefit category - Benefit name - Tokens in: x
  | "SERVICE_DELIVERY_CANCELED_BY_SERVICE_PROVIDER" // [Admin] Benefits: Canceled - Benefit category - Benefit name // [Alumni] Benefits: Canceled - Benefit category - Benefit name - Tokens in: x
  | "SERVICE_CREATED_BY_SERVICE_PROVIDER" // [Admin] Benefits: Added - Benefit category - Benefit name
  | "SERVICE_EDITED_BY_SERVICE_PROVIDER" // [Admin] Benefits: Edited - Benefit category - Benefit name
  | "SERVICE_DELETED_BY_SERVICE_PROVIDER"; // [Admin] Benefits: Deleted - Benefit category - Benefit name

export interface IUser {
  id: string;
  // avatar: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  preferences?: Record<string, unknown>;
  wallet?: {
    balance: number;
  };
  proposedServices: string[];
}

export interface ITxUser {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  name: string;
  address: string;
}
export interface INotification {
  timestamp: number;
  id: string;
  status: "SUCCESS" | "PENDING" | "ERROR";
  message: string;
  link: {
    href: string;
    text: string;
  };
  serviceId: string;
  fromId: string;
  toId: string;
  txHash: string;
}

export interface ITransaction {
  txId: number; // deal Id
  txTimestamp: number;
  txHash: string;
  txStatus: "SUCCESS" | "PENDING" | "ERROR";
  txType: string;
  txCode: TransactionCode;
  txAmount: number;
  from: ITxUser;
  to: ITxUser;
  service: {
    id: string;
    kind: "Service";
    name: string;
    audience: UserRole;
    serviceCategory: {
      id: string;
      kind: "ServiceCategory";
      name: string;
      audience: UserRole;
    };
    serviceProviderName?: string;
  };
  polygonScanUrl: string;
  notification?: INotification;
}

export interface IService {
  id: string;
  name: string;
  price: number;
  unit: string;
  rating: number[];
  summary: string;
  description: string;
  category?: {
    id: string;
    name: ServiceCategoryName;
    description: string;
  };
  avatar?: string;
  blockchainId?: string;
  serviceCategory: {
    id: string;
    name: ServiceCategoryName;
    description: string;
  };
  serviceProvider: {
    id?: string;
    name: string;
    program: string;
    graduatedYear: string;
    experience: Entities.User.Identity.Alumni["experience"];
    email?: string;
    firstname?: string;
    lastname?: string;
    avatar?: string;
  };
  serviceProviderName?: string;
  annotations: Array<{
    id: string;
    description: string;
  }>;
}

/**
 * Pages
 */
export namespace Onboarding {
  export namespace Page {
    export interface Props {
      lang: any;
      // user: {
      //   id: string;
      //   role: ServiceProviderType;
      //   airdrop: number;
      //   firstname: string;
      //   lastname: string;
      //   email: string;
      //   wallet: {
      //     balance: number;
      //   };
      // };
      // annotations: Array<{
      //   id: string;
      //   kind: 'Annotation';
      //   category: ServiceCategoryName;
      //   name: string;
      //   description: string;
      //   label: string;
      //   value: string;
      // }>;
      serviceCategories: Array<{
        id: string;
        kind: "ServiceCategory";
        name: ServiceCategoryName;
        audience: Audience;
        serviceProviderType: UserRole;
        href: string;
        description: string;
        defaultPrice: number;
        defaultUnit: string;
        disabled?: boolean;
      }>;
    }
  }
  export namespace OnboardingForm {
    export interface Props {
      width?: number;
      totalPages: number;
      // data: {
      //   annotations: Onboarding.Page.Props['annotations'];
      //   serviceCategories: Onboarding.Page.Props['serviceCategories'];
      //   // user: Onboarding.Page.Props['user'];
      // };
      setProgress: Dispatch<SetStateAction<number>>;
      animate?: boolean;
      className?: string;
      lang: LangType;
    }
  }
  export namespace SelectServicesFormPage {
    export interface Props {
      // services: Onboarding.Page.Props['annotations'];
      // serviceCategories: Onboarding.Page.Props['serviceCategories'];
      setDisableNext: Dispatch<SetStateAction<boolean>>;
      // dispatch: Dispatch<{ type: string; payload: any }>;
      // user: Onboarding.Page.Props['user'];
      lang: LangType;
    }
  }
  export namespace SelectBenefitCategoriesFormPage {
    export interface Props {
      // categories: Onboarding.Page.Props['serviceCategories'];
      // role: UserRole;
      setDisableNext: Dispatch<SetStateAction<boolean>>;
      dispatch: Dispatch<{ type: string; payload: any }>;
      lang: LangType;
    }
  }
}

export namespace Dasboard {
  export namespace Page {
    export interface Props {
      lang: any;
      totalUsers: number;
    }
  }

  export namespace ServiceDeliveryDetail {
    export interface Props {
      transaction: Api.Transaction;
      service: Api.Service | undefined;
      // onUpdate: (() => any)
    }
  }
  export namespace NotificationList {
    export interface Props {
      items: Array<INotification>;
    }
  }
  export namespace MyBenefitsList {
    export interface Props {
      list: Api.Service[];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      recommended: IUser["proposedServices"];
    }
  }
}

export namespace Benefits {
  export namespace Page {
    export interface Props {
      lang: any;
    }
  }
  export namespace CategoryList {
    export interface Props {
      serviceCategories: Api.Category[];
    }
  }

  export namespace DetailPage {
    // import Service = Api.Service;

    export interface Props {
      lang: any;
      //      user: MentorsList.Props['user'];
      //       isLoading: boolean;
      category: Api.Category;
      // services: Array<Service>;
      // bookedServices?: Array<string>;
    }
  }
  export namespace MentorsList {
    export interface Props {
      services: Array<Service>;
      variant?: "dashboard";
      bookedServices?: Array<string>;
    }
  }
  export namespace MentorsDetail {
    import Service = Api.Service;

    export interface Props {
      service: Service;
      booked?: boolean;
      onServiceBooked?: () => any;
    }
  }
  export namespace BenefitsList {
    import Service = Api.Service;

    export interface Props {
      services: Service[];
      variant?: "dashboard" | "default";
      bookedServices?: Array<string>;
      onServiceBooked?: () => any;
      isLoading: boolean;
    }
  }
  export namespace Benefit {
    import Service = Api.Service;

    export interface Props {
      service: Service;
      variant?: "dashboard" | "default";
      bookedServices?: Array<string>;
      onServiceBooked?: () => any;
      isLoading: boolean;
    }
  }
  export namespace BenefitsDetail {
    import Service = Api.Service;

    export interface Props {
      service: Service;
    }
  }
}

export namespace Services {
  export namespace Page {
    import Service = Api.Service;

    export interface Props {
      lang: any;
      user: {
        id: string;
        role: UserRole;
        firstName: string;
        lastName: string;
        email: string;
        avatar: string;
        preferences: Record<string, unknown>;
        proposedServices: string[];
      };
      services: Array<Service>;
    }
  }
  export namespace ServicesList {
    export interface Props {
      mentoringServices?: any;
      list: any;
      desc:string;
      title: string;
      annotations: any;
      icon:string;
      serviceCategory: string;
      serviceId: Services.Page.Props["services"][number]["id"];
      setList?: React.Dispatch<
        React.SetStateAction<
          Services.Page.Props["services"][number]["category"]
        >
      >;
    }
  }
  export namespace ServicesDetail {
    export interface Props {
      annotations: any[];
      title: string;
      serviceId: Services.Page.Props["services"][number]["id"];
    }
  }
}

export namespace Wallet {
  export namespace Page {
    export interface Props {
      lang: any;
      user: {
        id: string;
        role: UserRole;
        firstName: string;
        lastName: string;
        email: string;
        avatar: string;
        wallet: {
          balance: number;
          address: string;
        };
      };
    }
  }
  export namespace DashboardMetrics {
    export interface Props {
      metrics?: Api.Metrics | undefined;
      userMetrics?: Api.UserMetrics | undefined;
      set: "impact" | "facts";
    }
  }
  export namespace TransactionList {
    export interface Props {
      transactions: Array<Notification>;
      isLoading: boolean;
    }
  }
}

export namespace Notifications {
  export namespace Page {
    export interface Props {
      lang: any;
      user: any;
    }
  }
  export namespace NotificationList {
    export interface Props {
      transactions: Array<Notification>;
    }
  }
}

export namespace Profile {
  export namespace Page {
    export interface Props {
      lang: any;
      userAbout: string;
      // user: {
      //   id: string;
      //   kind: 'Alumni' | 'Student' | 'ServiceProvider';
      //   name: string;
      //   avatar: string;
      //   role: 'ALUMNI' | 'STUDENT' | 'SERVICE_PROVIDER';
      //   firstName: string;
      //   lastName: string;
      //   email: string;
      //   program: string;
      //   graduatedYear?: string;
      //   startedYear?: string;
      //   topic: string;
      //   airdrop: number;
      //   experience?: Array<{
      //     id: string;
      //     kind: 'Experience';
      //     title: string;
      //     role: string;
      //     industry: string;
      //     company: string;
      //     country: string;
      //     from: string;
      //     to: string;
      //     isCurrent: boolean;
      //   }>;
      // };
    }
  }
}

export namespace Admin {
  export namespace ServiceDeliveryPage {
    export interface Props {
      lang: any;
      transactions: Array<
        ITransaction & {
          deliveryStatus: "CONFIRMED" | "PENDING" | "CANCELED";
        }
      >;
      // user: Onboarding.Page.Props['user'];
    }
  }
  export namespace ServiceDeliveryList {
    export interface Props {
      transactions: any;
      loading: boolean;
      onUpdate: () => any;
    }
  }

  export namespace ServiceCataloguePage {
    export interface Props {
      lang: any;
      services: Api.Service[];
      serviceCategories: Api.Category[];
      provider: string;
      // user: Onboarding.Page.Props['user'];
    }
  }
  export namespace ServiceCatalogueList {
    export interface Props {
      services: Admin.ServiceCataloguePage.Props["services"];
    }
  }
}
/**
 * Navigation
 */
export namespace Navigation {
  export namespace MobileHamburger {
    export interface Props {
      onMobileHamburgerClick: Dispatch<boolean>;
      showMobileHamburger?: boolean;
      showBreadCrumb?: boolean;
    }
  }
  export namespace MobileNavigation {
    export interface Props {
      showMobileSidebarNavigation: boolean;
      setShowMobileSidebarNavigation: Dispatch<SetStateAction<boolean>>;
    }
  }
  export namespace Navigation {
    export interface Props {
      items: Array<{ title: string; link: string; external?: boolean }>;
      variant: "horizontal" | "vertical";
    }
  }
  export namespace NavigationItem {
    export interface Props {
      href: string;
      children: string | ReactElement;
      variant: "highlight" | "default";
      disabled?: boolean;
      external?: boolean;
    }
  }
}
