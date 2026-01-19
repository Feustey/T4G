/**
 * Types extraits de @t4g/service/data pour usage standalone dans apps/dapp
 * Version simplifiée sans dépendances MongoDB/Typegoose
 */

export type TransactionCode =
  | "WELCOME_BONUS_RECEIVED"
  | "SERVICE_PROVIDED"
  | "SERVICE_BOOKED_BY_STUDENT"
  | "SERVICE_BOOKED_BY_ALUMNI"
  | "SERVICE_DELIVERY_CANCELED_BY_STUDENT"
  | "SERVICE_DELIVERY_CONFIRMED_BY_STUDENT"
  | "SERVICE_REDEEMED_BY_ALUMNI"
  | "SERVICE_DELIVERY_CONFIRMED_BY_SERVICE_PROVIDER"
  | "SERVICE_DELIVERY_CANCELED_BY_SERVICE_PROVIDER"
  | "SERVICE_CREATED_BY_SERVICE_PROVIDER"
  | "SERVICE_EDITED_BY_SERVICE_PROVIDER"
  | "SERVICE_DELETED_BY_SERVICE_PROVIDER";

export type ROLE_TYPE = "SERVICE_PROVIDER" | "ALUMNI" | "STUDENT";

export interface Notification {
  readonly id: string;
  tx: string;
  user: string;
  amount: number;
  type: TransactionCode;
  message: string;
  link: string;
  ts: Date;
  sent: Date;
}

export interface ServiceCategory {
  readonly _id: string;
  name: string;
  kind: string;
  description: string;
  href: string;
  defaultPrice: number;
  defaultUnit: string;
  icon: string;
  disabled: boolean;
  serviceProviderType: ROLE_TYPE;
  audience: ROLE_TYPE;
}
