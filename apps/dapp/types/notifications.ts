import { UserType } from './userType';

export interface NotificationType {
  amount: number;
  link: string;
  message: string;
  ts: Date;
  tx: string;
  type: string; // "SERVICE_BOOKED_BY_STUDENT" | "SERVICE_DELIVERY_CONFIRMED_BY_STUDENT" | "SERVICE_DELIVERY_CANCELED_BY_STUDENT" | "WELCOME_BONUS"
  user: UserType['id'];
  id: string;
}
