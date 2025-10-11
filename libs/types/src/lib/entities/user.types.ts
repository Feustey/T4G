import { UserRole } from "../components/index.types";

export interface User {
  kind: string;
  title: string;
  href: string;
  description: string;
  dateCreated?: string;
  dateUpdated?: string;
}

export namespace Identity {
  export interface User {
    id: string;
    kind: "Alumni" | "ServiceProvider" | "Student";
    avatar: string;
    firstName: string;
    lastName: string;
    name: string;
    role: UserRole;
    wallet: {
      id: string;
      kind: "Wallet";
      name: string;
      balance: number;
      isActive: boolean;
    };
  }
  export interface Alumni extends User {
    graduatedYear: string;
    program: string;
    topic: string;
    airdrop: number;
    experience: Array<{
      id: string;
      kind: "Experience";
      title: string;
      role: string;
      city: string;
      industry: string;
      company: string;
      country: string;
      from: string;
      to: string;
      isCurrent?: boolean;
    }>;
    preferences: {
      serviceCategories: string[];
    };
    proposedServices: string[];
  }
  export interface Student extends User {
    startedYear: string;
    program: string;
    topic: string;
    airdrop: number;
    preferences: {
      serviceCategories: string[];
    };
    proposedServices: string[];
  }
  export interface ServiceProvider extends User {}
}
