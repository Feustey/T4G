import { UserExperienceType } from '../types';
import { apiFetch } from './config';

export async function setUserExperience(
  experience: UserExperienceType
): Promise<UserExperienceType> {
  try {
    const res = await apiFetch('/experiences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(experience),
    });
    if (res.ok) {
      return experience as UserExperienceType;
    }
  } catch (error) {
    console.log(error);
  }
  return Promise.resolve(experience);
}

export async function getUserExperience(): Promise<UserExperienceType[]> {
  const response = await apiFetch('/experiences');
  const result = await response.json();
  return result as UserExperienceType[];
}
