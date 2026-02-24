export enum COLLECTION_NAMES {
  BENEFITS = "benefits",
  USERS = "users",
  SERVICES = "services",
}

export enum MODULE_NAMES {
  SERVICE_CATEGORY = "Benefit Category",
  BENEFIT = "Benefit",
  ANNOTATION = "Annotation",
  USER = "User",
  SERVICE = "Service",
}

// Valeurs alignées sur les rôles sérialisés par le backend Rust
export enum PROVIDER_TYPES {
  ALU = "alumni",
  STU = "mentee",
  SP = "service_provider",
}

export type ROLE_TYPE = "alumni" | "mentee" | "mentor" | "service_provider" | "admin";
