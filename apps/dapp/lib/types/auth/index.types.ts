import { Common } from "../types";

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
  // Champs mentoring
  is_mentor_active?: boolean;
  mentor_topics?: string[];
  learning_topics?: string[];
  mentor_bio?: string;
  mentor_tokens_per_hour?: number;
}

// Valeurs alignées sur les rôles sérialisés par le backend Rust
export type ROLE_TYPE = "alumni" | "mentee" | "mentor" | "service_provider" | "admin";
