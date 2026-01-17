import { Common } from "../types";

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  is_student: boolean;
  is_staff: boolean;
  is_speaker: boolean;
  is_graduated: boolean;
  role: ROLE_TYPE; //string;
}

export type ROLE_TYPE = "SERVICE_PROVIDER" | "ALUMNI" | "STUDENT";
