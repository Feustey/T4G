/**
 * Transactions DAO - PostgreSQL Version
 * Replaces MongoDB transactionsDAO with REST API calls to Rust backend
 */

import { transactionsAPI, BlockchainTransaction } from "apps/dapp/services/postgresApiClient";

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

async function getAll(): Promise<BlockchainTransaction[]> {
  // Note: The API doesn't have a "get all" endpoint
  // This would need to be implemented if needed
  return [];
}

async function getMintFor(userAddress: string): Promise<BlockchainTransaction[]> {
  const txs = await transactionsAPI.getByAddress(userAddress);
  return txs.filter(tx =>
    tx.transfer_from === MINT_ADDRESS &&
    tx.transfer_to === userAddress
  );
}

async function getLastBlock(): Promise<number | undefined> {
  const lastBlock = await transactionsAPI.getLastBlock();
  return lastBlock || undefined;
}

async function getByTxHash(hash: string): Promise<BlockchainTransaction | null> {
  try {
    return await transactionsAPI.getByHash(hash);
  } catch (error) {
    return null;
  }
}

async function getByAddress(address: string): Promise<BlockchainTransaction[]> {
  return transactionsAPI.getByAddress(address);
}

async function save(hash: string, _entity: Partial<BlockchainTransaction>): Promise<any> {
  await transactionsAPI.create({
    hash,
    ..._entity,
  } as any);
  return { acknowledged: true, upsertedCount: 1 };
}

async function totalSupply(): Promise<any[]> {
  const total = await transactionsAPI.getTotalSupply();
  return [{ _id: null, qty: total }];
}
