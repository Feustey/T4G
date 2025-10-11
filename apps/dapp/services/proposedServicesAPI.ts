import { apiFetch } from './config';

export interface ProposedServicesApiState {
  value: number;
}

const proposedServicesPath = '/users/me/proposed-services';

export async function updateProposedServices(
  proposedServices: string[]
): Promise<{ data: string[] }> {
  const response = await apiFetch(proposedServicesPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(proposedServices),
  });
  const result = await response.json();

  return result;
}

export async function getProposedServices(): Promise<string[]> {
  const response = await apiFetch(proposedServicesPath);
  const result = await response.json();
  return result;
}

export async function fetchMentorProposedServices(
  userId: string
): Promise<string[]> {
  const response = await apiFetch(`/users/${userId}/proposed-services`);
  const result = await response.json();
  return result;
}
