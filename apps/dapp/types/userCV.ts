import { UserExperienceType } from './userExperience';
import { UserStudiesType } from '.';

export type UserCVType = UserStudiesType & {
  experiences: UserExperienceType[];
};
