import { BigNumber, ethers } from "ethers";
import { Alchemy, AssetTransfersParams, Network } from "alchemy-sdk";
import { identitiesDAO, transactionsDAO } from "@t4g/service/data";
import { formatUnits } from "ethers/lib/utils";
import { ERC20Meta__factory } from "@t4g/service/smartcontracts";
import { getNetwork } from "@ethersproject/providers";
import * as process from "process";
import { Transaction } from "@t4g/service/data";

export const serviceMiddleware = {
  getUserBalance,
  getTokenTotalSupply,
  getTokenTransfer,
  getUserStat,
  getUserNonce,
  getTransactionCount,
  getDeals: getDealsForUser,
  getWelcomeBonus,
};

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: process.env.ALCHEMY_NETWORK as Network,
});
const etherSigner = new ethers.Wallet(
  process.env.PRIVATE_KEY!,
  new ethers.providers.AlchemyProvider(
    getNetwork(parseInt(process.env.CHAIN_ID!)),
    process.env.ALCHEMY_API_KEY
  )
);
const tokenContract = ERC20Meta__factory.connect(
  process.env.TOKEN_CONTRACT!,
  etherSigner
);

/**
 * get T4G token balance for user, specified by address
 * @param address
 */
async function getUserBalance(address: string): Promise<number> {
  return alchemy.core
    .getTokenBalances(address, [process.env.TOKEN_CONTRACT!.toLowerCase()])
    .then((res) => res.tokenBalances[0].tokenBalance)
    .then((raw) => parseInt(formatUnits(BigNumber.from(raw), 18)))
    .catch((e) => {
      console.warn("error on getUserBalance for address " + e);
      return 0;
    });
}

/**
 * get T4G token total supply
 */
async function getTokenTotalSupply(): Promise<number> {
  return transactionsDAO.totalSupply().then((s) => {
    if (s.length == 0) {
      return 0;
    } else {
      return s[0].qty as number;
    }
  });
}

async function getTokenTransfer(
  transaction: string
): Promise<Transaction | null> {
  return transactionsDAO.getByTxHash(transaction);
}

async function getUserStat(address: string) {
  if (address == "0x") {
    console.warn("invalid address: " + address);
    return {
      id: address,
      tokensUsed: 0,
      tokensEarned: 0,
      benefitsEnjoyed: 0,
      servicesProvided: 0,
    };
  }
  const allTxs = await transactionsDAO.getByAddress(address);
  const pending = allTxs.filter((e) => e.event === "DealCreated");
  const validated = allTxs.filter((e) => e.event === "DealValidated");
  const asBuyer = validated.filter((v) => v.serviceBuyer == address);
  const asProvider = validated.filter((v) => v.serviceProvider == address);

  const tokensUsed = asBuyer
    .map((v) => v.transferAmount)
    .reduce<number>((a, c) => {
      return a + (c || 0);
    }, 0);
  const tokensEarned = asProvider
    .map((v) => v.transferAmount)
    .reduce<number>((a, c) => {
      return a + (c || 0);
    }, 0);

  return {
    id: address,
    tokensUsed: tokensUsed,
    tokensEarned: tokensEarned,
    benefitsEnjoyed: asBuyer.length,
    servicesProvided: asProvider.length,
  };
}

async function getUserNonce(address: string) {
  return alchemy.core.getTransactionCount(address, "pending");
}

async function getTransactionCount(contractAddress: string) {
  const txCount = (await transactionsDAO.getAll()).length;
  const deals = await transactionsDAO.getAll({ event: "DealValidated" });
  const tokensExchanged = deals
    .map((v) => v.transferAmount)
    .reduce<number>((acc, now) => acc + (now || 0), 0);
  const interactionCount = deals.length;
  return {
    txCount: txCount,
    tokensExchanged: tokensExchanged,
    interactionCount: interactionCount,
  };
}

async function getDealsForUser(userAddress: string): Promise<Transaction[]> {
  return transactionsDAO.getByAddress(userAddress);
}

async function getWelcomeBonus(
  userAddress: string
): Promise<Transaction | undefined> {
  return transactionsDAO.getMintFor(userAddress).then((mints) => {
    if (mints.length > 0) return mints[0];
    else return undefined;
  });
}
