import 'next-auth';
import { Auth } from './auth';

declare module 'next-auth' {
  export interface Session {
    user: Auth.User;
  }
}
