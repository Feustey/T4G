import { ReceiveServiceType, SendServiceType, StatusType } from '../types';
import { apiFetch } from './config';

export async function creatService(
  service: SendServiceType
): Promise<StatusType> {
  let status: StatusType = 'PENDING';
  try {
    const res = await apiFetch('/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });
    if (res.status === 200) {
      return (status = 'SUCCESS');
    } else {
      return (status = 'ERROR');
    }
  } catch (error) {
    return (status = 'ERROR');
  }
  return Promise.resolve(status);
}

export async function getServiceByIdServerSide(
  serviceId: string
): Promise<ReceiveServiceType> {
  const response = await apiFetch(`/services/${serviceId}`);
  const result = await response.json();
  return result as ReceiveServiceType;
}

export async function bookServiceById(
  serviceId: string
): Promise<{ status: StatusType; message: string }> {
  let response: { status: StatusType; message: string } = {
    message: '',
    status: 'PENDING',
  };
  try {
    const res = await apiFetch(`/services/${serviceId}/book`);
    if (res.status === 200) {
      response = {
        message: '',
        status: 'SUCCESS',
      };
    } else if (res.status === 403) {
      response = {
        message: 'No money',
        status: 'ERROR',
      };
    } else {
      response = {
        message: '',
        status: 'ERROR',
      };
    }
  } catch (error) {
    response = {
      message: '',
      status: 'ERROR',
    };
  }
  return response;
}

export async function cancelServiceById(
  serviceId: string
): Promise<{ status: StatusType; message: string }> {
  let response: { status: StatusType; message: string } = {
    message: '',
    status: 'PENDING',
  };
  try {
    const res = await apiFetch(`/services/${serviceId}/cancel`);
    if (res.status === 200) {
      response = {
        message: '',
        status: 'SUCCESS',
      };
    } else {
      response = {
        message: '',
        status: 'ERROR',
      };
    }
  } catch (error) {
    response = {
      message: '',
      status: 'ERROR',
    };
  }
  return response;
}

export async function confirmServiceById(
  serviceId: string
): Promise<{ status: StatusType; message: string }> {
  let response: { status: StatusType; message: string } = {
    message: '',
    status: 'PENDING',
  };
  try {
    const res = await apiFetch(`/services/${serviceId}/validate`);
    if (res.status === 200) {
      response = {
        message: '',
        status: 'SUCCESS',
      };
    } else {
      response = {
        message: '',
        status: 'ERROR',
      };
    }
  } catch (error) {
    response = {
      message: '',
      status: 'ERROR',
    };
  }
  return response;
}
