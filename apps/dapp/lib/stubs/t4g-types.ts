/**
 * Types extraits de @t4g/types pour usage standalone dans apps/dapp
 */

export namespace Auth {
  export interface User {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    is_staff: boolean;
    is_speaker: boolean;
    is_graduated: boolean;
    is_active: boolean;
    is_onboarded: boolean;
    role: ROLE_TYPE;
  }

  export type ROLE_TYPE = "mentor" | "mentee" | "alumni" | "service_provider" | "admin";
}

export namespace Common {
  export type ROLE_TYPE = "mentor" | "mentee" | "alumni" | "service_provider" | "admin";
}
