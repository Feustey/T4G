import { NotificationType } from '../types';
import { apiFetch } from './config';

export async function getUserNotifications(): Promise<NotificationType[]> {
  const response = await apiFetch('/users/me/notifications');
  const result = await response.json();
  return result as NotificationType[];
}
