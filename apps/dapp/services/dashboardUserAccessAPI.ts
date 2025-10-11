import { UserType } from '../types';
import { apiFetch } from './config';

export async function getDashboardAccessCount(
  userId: UserType['id']
): Promise<number> {
  return apiFetch(
    `/users/${userId}/disable-first-access`
  ).then((res) => res.json().then((data) => data.dashboardAccessCount as number))
      .catch((e) => {
        console.error(e);
        return 0;
      } );
  // const result = await response.json();
  // return result.dashboardAccessCount as number;
}
