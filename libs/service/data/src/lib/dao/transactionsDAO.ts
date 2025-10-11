import { Transaction, TransactionModel } from "@t4g/service/data";
import { FilterQuery } from "mongoose";
import { UpdateResult } from "mongodb";

export const transactionsDAO = {
  getAll,
  getMintFor,
  getByTxHash,
  getByAddress,
  getLastBlock,
  save,
  totalSupply,
};

const MINT_ADDRESS = "0x0000000000000000000000000000000000000000";

async function getAll(
  filter: FilterQuery<Transaction> = {}
): Promise<Transaction[]> {
  return TransactionModel.find(filter).lean();
}

async function getMintFor(userAddress: string): Promise<Transaction[]> {
  return getAll({
    $and: [{ transferFrom: MINT_ADDRESS }, { transferTo: userAddress }],
  });
}

async function getLastBlock(
  filter: FilterQuery<Transaction>
): Promise<number | undefined> {
  return TransactionModel.findOne(filter)
    .sort("-block") // give me the max
    .lean()
    .then((t) => t?.block);
}

async function getByTxHash(hash: string): Promise<Transaction | null> {
  return TransactionModel.findOne({ hash: hash }).lean();
}

async function getByAddress(address: string): Promise<Transaction[]> {
  return getAll({
    $or: [
      { serviceBuyer: address },
      { serviceProvider: address },
      { transferFrom: address },
      { transferTo: address },
      { from: address },
      { to: address },
    ],
  });
}

async function save(
  hash: string,
  _entity: Partial<Transaction>
): Promise<UpdateResult> {
  return TransactionModel.updateOne({ hash: hash }, _entity, { upsert: true });
}

async function totalSupply() {
  return TransactionModel.aggregate([
    { $match: { transferFrom: MINT_ADDRESS } },
    { $group: { _id: null, qty: { $sum: "$transferAmount" } } },
  ]);
}
