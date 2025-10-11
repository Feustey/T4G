import { UserCVType, UserStudiesType, UserType } from '../types';
import { apiFetch } from './config';

export async function setUserCV(
  studies: UserStudiesType
): Promise<UserStudiesType> {
  try {
    const res = await apiFetch('/users/me/cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studies),
    });
    if (res.status === 200) {
      return studies as UserStudiesType;
    }
  } catch (error) {
    console.log(error);
  }
  return Promise.resolve(studies);
}
