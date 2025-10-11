/**
 * Categories DAO - PostgreSQL Version
 * Replaces MongoDB categoriesDAO with REST API calls to Rust backend
 */

import { Api } from "@t4g/types";
import { categoriesAPI, ServiceCategory } from "apps/dapp/services/postgresApiClient";

export const categoriesDAO = {
  get,
  getAll,
  getById,
  getByIdDetailed,
  getByAudience,
  getByProviderType,
  create,
  update,
  delete: _delete,
  getByName,
  toCategory,
  toCategories,
};

export const MENTORING_CATEGORY_NAME = "Mentoring";

async function getAll(): Promise<ServiceCategory[]> {
  return categoriesAPI.getAll();
}

async function get(id: ServiceCategory | string): Promise<ServiceCategory | null> {
  if (typeof id === 'object') return id;
  return categoriesAPI.getById(id);
}

async function getById(id: string): Promise<ServiceCategory | null> {
  try {
    return await categoriesAPI.getById(id);
  } catch (error) {
    return null;
  }
}

async function getByName(name: string): Promise<Api.Category | null> {
  const categories = await categoriesAPI.getAll();
  const found = categories.find(c => c.name === name);
  return found ? toCategory(found) : null;
}

async function getByAudience(audience: string): Promise<ServiceCategory[]> {
  return categoriesAPI.getByAudience(audience);
}

async function getByProviderType(serviceProviderType: string): Promise<ServiceCategory[]> {
  const categories = await categoriesAPI.getAll();
  return categories.filter(c => c.service_provider_type === serviceProviderType);
}

async function create(_entity: Partial<ServiceCategory>): Promise<ServiceCategory> {
  return categoriesAPI.create(_entity);
}

async function update(id: string, _entity: Partial<ServiceCategory>): Promise<any> {
  await categoriesAPI.update(id, _entity);
  return { acknowledged: true, modifiedCount: 1 };
}

async function _delete(id: string): Promise<any> {
  await categoriesAPI.delete(id);
  return { acknowledged: true, deletedCount: 1 };
}

async function getByIdDetailed(id: string): Promise<ServiceCategory | null> {
  return getById(id);
}

export function toCategory(cat: ServiceCategory): Api.Category {
  return {
    id: cat.id,
    name: cat.name,
    serviceProviderType: cat.service_provider_type as any,
    description: cat.description || '',
    defaultPrice: cat.default_price,
    defaultUnit: cat.default_unit,
    icon: cat.icon,
    disabled: cat.disabled || false,
  };
}

export function toCategories(cats: ServiceCategory[]): Api.Category[] {
  return cats.map(toCategory);
}
