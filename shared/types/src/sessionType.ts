import { UserType } from ".";

export type SessionType = {
  expires: string;
  user: UserType;
} | null;
