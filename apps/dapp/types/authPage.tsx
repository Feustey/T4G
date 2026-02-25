export type AuthPageType = {
  auth?: boolean;
  /** Rôles autorisés - format attendu par Auth: STUDENT, ALUMNI, ADMIN, SERVICE_PROVIDER ou lowercase */
  role?: string[];
};
