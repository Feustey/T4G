import { IconsT4G } from '../components';
import { UserRoleType } from './userRoleType';

export type CategoryType = {
  serviceProviderType: UserRoleType;
  name: string;
  kind: string;
  id: string;
  disabled: number;
  description: string;
  defaultUnit: string;
  defaultPrice: number;
  href: string;
  audience: UserRoleType;
  icon: keyof IconsT4G;
};
