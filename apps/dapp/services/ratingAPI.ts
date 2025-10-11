import { StatusType } from '../types';
import { apiFetch } from './config';

export async function setServiceRating(
  serviceId: string,
  rate: number,
  transactionHash: string
): Promise<StatusType> {
  let status: StatusType = 'PENDING';

  try {
    const res = await apiFetch(`/services/${serviceId}/rating`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionHash, rate }),
    });
    if (res.status === 200 || res.status === 201) {
      return (status = 'SUCCESS');
    }
  } catch (error) {
    console.log(error);
    return (status = 'ERROR');
  }
  return Promise.resolve(status);
}
