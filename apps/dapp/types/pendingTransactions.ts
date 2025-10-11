import { UserExperienceType } from './userExperience';
import { UserRoleType } from './userRoleType';

export type PendingTransactionType = {
  category: string;
  provider: {
    firstname: string;
    id: string;
    lastname: string;
    wallet: string;
    avatar: string;
    experiences: UserExperienceType[];
    program: string;
    graduatedYear: string;
    proposedServices: string[];
    role: UserRoleType;
  };
  price: number;
  hash: string;
  ts: Date;
  from: string;
  to: string;
  dealId: number;
  serviceId: string;
};
