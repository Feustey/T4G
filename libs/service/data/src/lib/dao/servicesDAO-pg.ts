/**
 * Services DAO - PostgreSQL Version
 * Replaces MongoDB servicesDAO with REST API calls to Rust backend
 */

import { Api } from "@t4g/types";
import { servicesAPI, Service } from "apps/dapp/services/postgresApiClient";
import { categoriesDAO } from "./categoriesDAO-pg";

export const servicesDAO = {
  getAll,
  getAllRegistered,
  getById,
  getByCategory,
  getByProvider,
  getByBlockchainId,
  create,
  update,
  delete: _delete,
  insertOrUpdate,
  toServices,
  getByIdFullServiceInfo,
};

async function getAll(): Promise<Service[]> {
  return servicesAPI.getAll();
}

async function getAllRegistered(role: string): Promise<Service[]> {
  return servicesAPI.getByAudience(role);
}

async function getByProvider(id: string): Promise<Service[]> {
  return servicesAPI.getByProvider(id);
}

async function getById(id: string): Promise<Service | null> {
  try {
    return await servicesAPI.getById(id);
  } catch (error) {
    return null;
  }
}

async function getByIdFullServiceInfo(id: string): Promise<Api.Service> {
  const service = await servicesAPI.getById(id);
  return toApiService(service);
}

async function getByBlockchainId(id: number): Promise<Service | null> {
  const services = await servicesAPI.getAll();
  return services.find(s => s.blockchainId === id) || null;
}

async function getByCategory(categoryId: string): Promise<Api.Service[]> {
  const services = await servicesAPI.getByCategory(categoryId);
  return Promise.all(services.map(toApiService));
}

async function create(_entity: Partial<Service>): Promise<Service> {
  return servicesAPI.create({
    name: _entity.name!,
    unit: _entity.unit,
    description: _entity.description,
    summary: _entity.summary,
    avatar: _entity.avatar,
    price: _entity.price!,
    audience: 'SERVICE_PROVIDER',
    category_id: _entity.category?.id,
    service_provider_id: _entity.provider?.id!,
    annotations: [],
  });
}

async function update(id: string, _entity: Partial<Service>): Promise<any> {
  await servicesAPI.update(id, _entity);
  return { acknowledged: true, modifiedCount: 1 };
}

async function insertOrUpdate(filter: any, _entity: Partial<Service>): Promise<any> {
  // Try to find existing service
  const services = await servicesAPI.getAll();
  const existing = services.find(s =>
    s.provider?.id === filter.serviceProvider ||
    s.name === filter.name
  );

  if (existing) {
    return update(existing.id, _entity);
  } else {
    await create(_entity);
    return { acknowledged: true, upsertedCount: 1 };
  }
}

async function _delete(id: string): Promise<any> {
  await servicesAPI.delete(id);
  return { acknowledged: true, deletedCount: 1 };
}

function toApiService(service: Service): Api.Service {
  return {
    id: service.id,
    name: service.name,
    unit: service.unit,
    description: service.description || '',
    summary: service.summary || '',
    avatar: service.avatar,
    price: service.price,
    rating: service.rating,
    blockchainId: service.blockchainId,
    category: service.category ? {
      id: service.category.id,
      name: service.category.name,
    } : undefined,
    provider: service.provider ? {
      id: service.provider.id,
      firstName: service.provider.firstName,
      lastName: service.provider.lastName,
      wallet: service.provider.wallet,
      avatar: service.provider.avatar,
      program: service.provider.program,
      graduatedYear: service.provider.graduatedYear,
      about: service.provider.about,
      proposedServices: [],
      experiences: [],
    } : undefined,
    supply: service.supply,
  };
}

async function toServices(services: Service[]): Promise<Api.Service[]> {
  return Promise.all(services.map(toApiService));
}
