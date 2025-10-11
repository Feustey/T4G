import { UserRoleType } from "./userRoleType";

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
