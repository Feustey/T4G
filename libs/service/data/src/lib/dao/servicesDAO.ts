import {
  DbService,
  ServiceModel,
  experiencesDAO,
} from "@t4g/service/data";
import { DeleteResult, ObjectId, UpdateResult } from "mongodb";
import { FilterQuery } from "mongoose";
import { categoriesDAO } from "libs/service/data/src/lib/dao/categoriesDAO";
import { identitiesDAO } from "libs/service/data/src/lib/dao/identitiesDAO";
import { Api } from "@t4g/types";

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

async function getAll(
  filter: FilterQuery<DbService> = {}
): Promise<DbService[]> {
  return ServiceModel.find(filter).lean();
}

async function getAllRegistered(role: string): Promise<DbService[]> {
  return getAll({
    blockchainId: { $exists: true },
    audience: role,
  });
}

async function getByProvider(id: string): Promise<DbService[]> {
  return ServiceModel.find({ serviceProvider: new ObjectId(id) })
    .populate("category")
    .populate("blockchainId")
    .populate("totalSupply")
    .populate("txHash")
    .lean();
}

async function getById(id: string): Promise<DbService | null> {
  return ServiceModel.findOne({ _id: new ObjectId(id) }).lean();
}

async function getByIdFullServiceInfo(id: string): Promise<Api.Service> {
  const services = await ServiceModel.find({ _id: new ObjectId(id) })
    .lean()
    .then(toServices);
  return services[0] as Api.Service;
}

async function getByBlockchainId(id: string): Promise<DbService | null> {
  return ServiceModel.findOne({ blockchainId: id }).lean();
}

async function getByCategory(categoryId: string): Promise<Api.Service[]> {
  return ServiceModel.find({ category: new ObjectId(categoryId) })
    .lean()
    .then(toServices);
}

async function getByCategoryNameAndProvider(
  name: string,
  provider: string
): Promise<DbService | null> {
  const serviceName =
    name === "Mentoring" ? { description: name } : { name: name };
  return ServiceModel.findOne({ serviceProvider: provider, ...serviceName })
    .populate("category")
    .populate("serviceProvider")
    .populate("blockchainId")
    .populate("totalSupply")
    .populate("txHash")
    .lean();
}

async function create(
  _entity: Partial<DbService & { dateCreated: string; dateUpdated: string }>
): Promise<DbService> {
  const entity = _entity;
  //entity.dateCreated = new Date().toISOString();
  //entity.dateUpdated = new Date().toISOString();
  return ServiceModel.create(entity);
}

async function update(
  id: string,
  _entity: Partial<DbService>
): Promise<UpdateResult> {
  const params = _entity;
  return ServiceModel.updateOne({ _id: new ObjectId(id) }, params);
}

async function insertOrUpdate(
  filter: FilterQuery<DbService>,
  _entity: Partial<DbService>
): Promise<UpdateResult> {
  return ServiceModel.updateOne(filter, _entity, { upsert: true });
}

async function _delete(id: string): Promise<DeleteResult> {
  return ServiceModel.deleteOne({ _id: new ObjectId(id) });
}

async function toService(
  dbSvc: DbService,
  categories: Api.IdName[],
  users: Api.UserWallet[]
): Promise<Api.Service> {
  const svcCategory: Api.IdName | undefined = categories.find(
    (c) => c.id === dbSvc.category.toString()
  );
  const svcProvider: Api.UserWallet | undefined = users.find(
    (c) => c.id === dbSvc.serviceProvider.toString()
  );
  console.log(svcProvider);
  if (!svcCategory || !svcProvider) {
    throw new Error("Category or provider not found");
  }
  const svcProviderExperiences = await experiencesDAO.getByUser(svcProvider.id);
  svcProvider.experiences = svcProviderExperiences;
  return {
    id: dbSvc._id,
    name: dbSvc.name,
    unit: dbSvc.unit,
    description: dbSvc.description,
    summary: dbSvc.summary,
    avatar: dbSvc.avatar,
    price: parseInt(dbSvc.price.toString()),
    rating: dbSvc.rating,
    blockchainId: dbSvc.blockchainId,
    category: svcCategory,
    provider: svcProvider,
    supply: dbSvc.totalSupply,
  } as Api.Service;
}

async function toServices(dbSvcs: DbService[]): Promise<Api.Service[]> {
  const [categories, users] = await Promise.all([
    categoriesDAO.getAll().then((res) =>
      res.map((a) => {
        return {
          id: a._id.toString(),
          name: a.name,
        } as Api.IdName;
      })
    ),
    identitiesDAO.getAllUsers().then((res) =>
      res.map((a) => {
        return {
          id: a.id,
          firstName: a.firstname,
          lastName: a.lastname,
          wallet: a.wallet,
          avatar: a.avatar,
          program: a.program,
          graduatedYear: a.graduatedYear,
          proposedServices: a.proposedServices,
          about: a.about,
        } as Api.UserWallet;
      })
    ),
  ]);
  return Promise.all(
    dbSvcs.map(async (s) => await toService(s, categories, users))
  );
}
