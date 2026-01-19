/**
 * Types copiés depuis shared/types pour usage standalone dans apps/dapp
 */

export type LocaleType = "fr" | "en";
export type LangType = any;

export type SessionType = {
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  image?: string;
  role?: UserRoleType;
};

export type UserRoleType = "student" | "alumni" | "speaker" | "staff";

export type UserType = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: UserRoleType;
  is_graduated: boolean;
  is_speaker: boolean;
  is_staff: boolean;
  is_student: boolean;
};
