import { ServiceCategory, ServiceCategoryModel } from "@t4g/service/data";
import { Api } from "@t4g/types";
import * as mongoose from "mongodb";
import { DeleteResult, ObjectId, UpdateResult } from "mongodb";
import { ROLE_TYPE } from "libs/types/src/lib/common/index.types";

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
  return ServiceCategoryModel.find().lean();
}

async function get(
  id: ServiceCategory | ObjectId
): Promise<ServiceCategory | null> {
  if (id instanceof ServiceCategory) return id;
  else
    return ServiceCategoryModel.findOne({
      _id: id,
    }).lean();
}

async function getById(oid: string): Promise<ServiceCategory | null> {
  return ServiceCategoryModel.findOne({
    _id: new ObjectId(oid),
  })?.lean();
}

async function getByName(name: string): Promise<Api.Category | null> {
  return ServiceCategoryModel.findOne({
    name: name,
  })
    .lean()
    .then((c) => {
      if (c) return toCategory(c);
      else return Promise.resolve(null);
    });
}

async function getByAudience(
  audience: ROLE_TYPE
): Promise<Array<ServiceCategory>> {
  return ServiceCategoryModel.find({ audience: audience }).lean();
}

async function getByProviderType(
  serviceProviderType: ROLE_TYPE
): Promise<ServiceCategory[]> {
  return ServiceCategoryModel.find({
    serviceProviderType: serviceProviderType,
  }).lean();
}

async function create(
  _entity: Partial<ServiceCategory>
): Promise<ServiceCategory> {
  const entity = _entity;
  return await ServiceCategoryModel.create(entity);
}

async function update(
  id: string,
  _entity: Partial<ServiceCategory>
): Promise<UpdateResult> {
  const params = _entity;
  return ServiceCategoryModel.updateOne(
    { id: new mongoose.ObjectId(id) },
    params
  );
}

async function _delete(id: string): Promise<DeleteResult> {
  return ServiceCategoryModel.deleteOne({
    id: new mongoose.ObjectId(id),
  });
}

async function getByIdDetailed(id: string): Promise<ServiceCategory | null> {
  const getByIdDetailedRes = await ServiceCategoryModel.findOne({
    id: new mongoose.ObjectId(id),
  })
    .populate("details")
    .lean();
  return getByIdDetailedRes as ServiceCategory;
}

export function toCategory(cat: ServiceCategory): Api.Category {
  return {
    id: cat._id.toString(),
    name: cat.name,
    serviceProviderType: cat.serviceProviderType,
    description: cat.description,
    defaultPrice: cat.defaultPrice,
    defaultUnit: cat.defaultUnit,
    icon: cat?.icon,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    disabled: cat.disabled | false,
  };
}

export function toCategories(cats: ServiceCategory[]): Api.Category[] {
  return cats.map(toCategory);
}
