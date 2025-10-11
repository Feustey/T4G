import { UserType } from './userType';

export interface UserMetricsType {
  tokensEarned: number;
  servicesProvided: number;
  tokensUsed: number;
  benefitsEnjoyed: number;
  id: UserType['id'];
}

export interface GlobalMetricsType {
  interactionsCount: number;
  tokensExchanged: number;
  tokensSupply: number;
  txsCount: number;
  usersCount: {
    alumnis: number;
    students: number;
    total: number;
  };
}
