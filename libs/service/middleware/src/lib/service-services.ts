import { Common } from "@t4g/types";
import { ethers, Wallet } from "ethers";
import {
  DbService,
  identitiesDAO,
  MENTORING_CATEGORY_NAME,
  categoriesDAO,
  servicesDAO,
} from "@t4g/service/data";
import { serviceBlockchainRPC } from "./service-blockchain-rpc";
import * as Sentry from "@sentry/nextjs";

export const serviceServices = {
  createForCategory,
  createMentoringService,
};

async function createMentoringService(providerId: string) {
  return categoriesDAO.getByName(MENTORING_CATEGORY_NAME).then((category) => {
    if (!category) return Promise.reject("mentoring category not found");
    return identitiesDAO.getById(providerId).then((provider) => {
      if (!provider) return Promise.reject("provider not found");
      return createForCategory(
        category.id,
        `${provider.firstname} ${provider.lastname.toUpperCase()}`,
        "",
        category.defaultPrice,
        category.defaultUnit,
        providerId
      );
    });
  });
}

async function createForCategory(
  categoryId: string,
  name: string | undefined = undefined,
  description: string | undefined = undefined,
  price: number | undefined = undefined,
  unit: string | undefined = undefined,
  providerId: string | undefined = undefined
) {
  return categoriesDAO.getById(categoryId).then((category) => {
    if (!category) return Promise.reject("category not found");
    return create(
      name || category.name,
      description || category.description,
      price || category.defaultPrice,
      unit || category.defaultUnit,
      categoryId,
      providerId,
      category.audience
    );
  });
}

async function create(
  name: string,
  description: string,
  price: number,
  unit: string,
  categoryId: string,
  wantedProviderId: string | undefined,
  audience: Common.ROLE_TYPE
) {
  try {
    if (isNaN(price)) throw Error("price must be a number");
    // const wallet = await identitiesDAO.getUser({role: "SERVICE_PROVIDER"}).then((sp)=> {
    //     if (!sp) throw Error("no wallet to create service");
    //     return identitiesDAO.getWallet(sp.id);
    // })
    // if (!wallet) throw Error(`no wallet`);
    const providerId =
      wantedProviderId ||
      (await identitiesDAO.getUser({ role: "SERVICE_PROVIDER" }).then((sp) => {
        if (!sp) throw Error("no wallet to create service");
        return sp.id;
      }));
    if (!providerId) throw Error(`no provider found for this service`);
    const wallet = await identitiesDAO.getWallet(providerId);
    if (!wallet) throw Error(`no wallet found for provider #${providerId}`);
    const entity = await servicesDAO.create({
      name,
      description,
      // summary: '',
      serviceProvider: providerId,
      category: categoryId,
      audience: audience,
      price: price,
      rating: [],
      unit: unit,
      // suggestion: true,
    } as Partial<DbService>);
    if (entity) {
      console.log("service-service : register call in create function");
      return await register(entity, wallet);
    } else throw Error("entity not saved");
  } catch (error) {
    // console.error("error:", error);
    return Promise.reject(error);
  }

  async function register(entity: DbService, wallet: Wallet) {
    let audience = "";
    let buyerCanCancel = false;
    let buyerCanValidate = false;
    let providerCanCancel = false;
    let providerCanValidate = false;
    let supply;
    if (entity.audience == "STUDENT") {
      audience = "student";
      buyerCanCancel = true;
      buyerCanValidate = true;
      providerCanCancel = false;
      providerCanValidate = false;
      supply = ethers.constants.MaxUint256;
    } else {
      audience = "alumni";
      buyerCanCancel = true;
      buyerCanValidate = false;
      providerCanCancel = true;
      providerCanValidate = true;
      supply = ethers.BigNumber.from(entity.totalSupply);
    }
    console.log("service-service");
    const registerResponse = await serviceBlockchainRPC
      .sendCreateServiceFor(
        wallet,
        name,
        entity.serviceProvider,
        audience,
        ethers.utils.parseUnits(price.toString()),
        supply,
        true,
        buyerCanCancel,
        providerCanCancel,
        buyerCanValidate,
        providerCanValidate
      )
      .then((tx) => {
        return tx.wait(1).then((res) => {
          return res.transactionHash;
        });
      })
      .catch((e) => {
        Sentry.captureException(e);
        throw e;
      });
    if (registerResponse) {
      entity.txHash = registerResponse;
      await servicesDAO.update(entity._id, entity);
      return entity;
    } else {
      throw Error("Error creating service!");
    }
  }
}
