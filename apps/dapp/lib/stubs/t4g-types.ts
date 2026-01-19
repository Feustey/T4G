/**
 * Types extraits de @t4g/types pour usage standalone dans apps/dapp
 */

export namespace Auth {
  export interface User {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    is_student: boolean;
    is_staff: boolean;
    is_speaker: boolean;
    is_graduated: boolean;
    role: ROLE_TYPE;
  }

  export type ROLE_TYPE = "SERVICE_PROVIDER" | "ALUMNI" | "STUDENT";
}

export namespace Common {
  export type ROLE_TYPE = "SERVICE_PROVIDER" | "ALUMNI" | "STUDENT";
}
