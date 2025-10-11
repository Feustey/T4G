import { UserType } from '../types';
import { apiFetch } from './config';

export async function setUserAvatar(
  image: string,
  userId: UserType['id']
): Promise<string> {
  try {
    apiFetch(`/users/${userId}/avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: image,
    });
    return image as string;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserAvatar(userId: UserType['id']): Promise<string> {
  const response = await apiFetch(`/users/${userId}/avatar`);
  const result = await response.text();
  return result as string;
}
export async function getUserAvatarServerSide(
  userId: UserType['id']
): Promise<string> {
  const response = await apiFetch(`/users/${userId}/avatar`);
  const result = await response.text();
  return result as string;
}
