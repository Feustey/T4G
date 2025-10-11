import { UserExperienceType } from './userExperience';

export type SendServiceType = {
  id?: string;
  kind?: string;
  price?: number;
  name?: string;
  unit?: string;
  description?: string;
  summary?: string;
  audience?: string;
  category?: string;
  serviceProvider?: string;
  annotations?: string[];
  suggestion?: boolean;
  rating: number[];
  totalSupply?: number;
};

export type ReceiveServiceType = {
  avatar?: string;
  blockchainId: number;
  category: {
    id: string;
    name: string;
  };
  description: string;
  id: string;
  name: string;
  price: number;
  provider: {
    about?: string;
    firstName: string;
    id: string;
    lastName: string;
    wallet: string;
    avatar: string;
    experiences: UserExperienceType[];
    program: string;
    graduatedYear: string;
    proposedServices: string[];
  };
  unit: number;
  rating: number[];
  summary: string;
  supply: number;
};
