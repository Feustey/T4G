import { ROLE_TYPE } from "../common/index.types";

export interface ApiError {
  message: string;
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  role: ROLE_TYPE;
  wallet: string;
  avatar: string;
  program: string;
  proposedServices: string[];
  school:string;
  graduatedYear: string;
  about: string;
}

export interface Service {
  id: string;
  name: string;
  unit: string;
  description: string;
  summary: string;
  avatar: string;
  price: number;
  supply: number;
  rating: number[];
  blockchainId: number;
  category: IdName;
  provider: UserWallet;
}

export interface Category {
  id: string;
  name: string;
  serviceProviderType: ROLE_TYPE;
  description: string;
  defaultPrice: number;
  defaultUnit: string;
  icon: string;
  disabled: boolean;
}

export interface UserWallet {
  id: string;
  firstName: string;
  lastName: string;
  wallet: string; //public address
  avatar?: string;
  program?: string;
  graduatedYear?: string;
  school?: string;
  proposedServices?: string[];
  experiences?: {
    title: string;
    company: string;
    city: string;
    country: string;
    role?: string;
    industry?: string;
    from: Date;
    to?: Date;
    isCurrent: boolean;
  }[];
}

export interface IdName {
  price: number;
  unit: string | undefined;
  id: string;
  name: string;
}

export interface Wallet {
  address: string;
  balance: number;
}

export interface Preferences {
  serviceCategories: Array<string>;

  // recommendedServices: Array<string>;
}

export interface CV {
  firstName: string;
  lastName: string;
  program: string;
  topic: string;
  school: string;
  graduatedYear: number;
  experiences: Array<Experience>;
}

export interface Experience {
  id: string;
  userId: string;
  title: string;
  company: string;
  role: string;
  city: string;
  country: string;
  industry: string;
  from: Date;
  to?: Date;
  isCurrent: boolean;
}

export interface Metrics {
  txsCount: number;
  tokensSupply: number;
  tokensExchanged: number;
  interactionsCount: number;
  usersCount: {
    total: number;
    students: number;
    alumnis: number;
  };
}

export interface UserMetrics {
  tokensUsed: number;
  tokensEarned: number;
  servicesProvided: number;
  benefitsEnjoyed: number;
}

export interface Transaction {
  hash: string;
  ts: Date;
  from: string;
  to: string;
  dealId: number;
  serviceId: string;
  // serviceName: string;
  // serviceCategoryName: string;
}

export interface ServiceAction {
  tx: string;
  status: "success" | "failed";
}
