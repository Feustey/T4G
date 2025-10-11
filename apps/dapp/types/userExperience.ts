import { countries, industries, roles } from '../data/en';

export type UserExperienceType = {
  title: string;
  company: string;
  city: string;
  country: typeof countries[number]['value'];
  role?: typeof roles[number]['value'];
  industry?: typeof industries[number]['value'];
  from: Date;
  to?: Date;
  isCurrent: boolean;
};
