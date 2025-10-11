import { DeleteResult, ObjectId, UpdateResult } from "mongodb";
import { FilterQuery } from "mongoose";
import { Identity, IdentityModel } from "@t4g/service/data";
import { ethers, Wallet } from "ethers";
import { Api } from "@t4g/types";

export const identitiesDAO = {
  getAllUsers,
  getById,
  getUser,
  getUserByWallet,
  getUserByEmail,
  create,
  update,
  insertOrUpdate,
  delete: _delete,
  getWallet,
  getAddress,
  getAll,
  get,
  getByWallet,
};

async function getAllUsers(
  filter: FilterQuery<Identity> = {}
): Promise<Api.User[]> {
  return getAll(filter).then((users) => {
    return users.map(toUser);
  });
}

async function getAll(filter: FilterQuery<Identity> = {}): Promise<Identity[]> {
  return IdentityModel.find(filter);
}

async function getById(id: string): Promise<Identity | null> {
  if (!ObjectId.isValid(id)) return null;
  return IdentityModel.findById(id).lean();
}

async function getAddress(id: string): Promise<string | null> {
  return IdentityModel.findById(id)
    .lean()
    .then((u) => {
      return u?.wallet?.address || null;
    });
}
async function getWallet(id: string): Promise<Wallet | null> {
  return IdentityModel.findById(id)
    .lean()
    .then((user) => {
      if (!user?.encryptedWallet) {
        return null;
      } else {
        return ethers.Wallet.fromEncryptedJson(
          user.encryptedWallet,
          process.env.WALLET_ENCRYPTION_PASS || "password"
        );
      }
    });
}

async function get(filter: FilterQuery<Identity>): Promise<Identity | null> {
  return IdentityModel.findOne(filter);
}

async function getUser(
  filter: FilterQuery<Identity>
): Promise<Api.User | null> {
  return IdentityModel.findOne(filter).then((u) => {
    if (!u) return null;
    return toUser(u);
  });
}

async function getUserByEmail(email: string): Promise<Api.User | null> {
  return getUser({ email: email });
}

async function create(_entity: Partial<Identity>): Promise<Api.User> {
  const entity = _entity;
  entity.dateCreated = new Date().toISOString();
  entity.dateUpdated = new Date().toISOString();
  return IdentityModel.create(entity).then(toUser);
}

async function update(
  id: string,
  _entity: Partial<Identity>
): Promise<UpdateResult> {
  const params = _entity;
  //TODO on wallet update => update service
  return IdentityModel.updateOne({ _id: new ObjectId(id) }, params);
}

async function insertOrUpdate(
  filter: FilterQuery<Identity>,
  _entity: Partial<Identity>
): Promise<UpdateResult> {
  //TODO on wallet update => update service
  return IdentityModel.updateOne(filter, _entity, { upsert: true });
}

async function _delete(id: string): Promise<DeleteResult> {
  return IdentityModel.deleteOne({ _id: new ObjectId(id) });
}

async function getUserByWallet(address: string): Promise<Api.User | null> {
  return getByWallet(address).then((identity) => {
    if (!identity) return null;
    return toUser(identity);
  });
}

async function getByWallet(address: string): Promise<Identity | null> {
  if (!address) return null;
  const res: Identity[] = await IdentityModel.find().lean();
  const users = res
    //.filter((u) => u['isOnboarded'] === true)
    .filter(
      (u) => (u?.wallet?.address?.toLowerCase() || "") === address.toLowerCase()
    );
  return users[0];
}
export function toUser(user: Identity): Api.User {
  return {
    id: user._id.toString(),
    firstname: user.firstname,
    lastname: user.lastname,
    about: user.about,
    role: user.role,
    wallet: user.wallet?.address,
    avatar: user.avatar,
    program: user.program,
    school: user.school,
    graduatedYear: user.graduatedYear,
    proposedServices: user.proposedServices,
  };
}
