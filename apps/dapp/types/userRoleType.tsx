import { ROLE_TYPE } from '../lib/types';

// Valeurs alignées sur les rôles sérialisés par le backend Rust
export type UserRoleType = ROLE_TYPE; // = 'alumni' | 'mentee' | 'mentor' | 'service_provider' | 'admin'
