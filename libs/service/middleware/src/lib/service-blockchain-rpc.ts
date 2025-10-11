import { BigNumber, ContractTransaction, ethers, Wallet } from "ethers";
import { serviceMiddleware } from "./service-middleware";
import { Alchemy } from "alchemy-sdk";
import { getNetwork, TransactionReceipt } from "@ethersproject/providers";
import {
  ERC20Meta__factory,
  Forwarder,
  Forwarder__factory,
  ServiceCatalog,
  ServiceCatalog__factory,
} from "@t4g/service/smartcontracts";
import * as ethSigUtil from "@metamask/eth-sig-util";
import axios from "axios";
import * as process from "process";
import { logg } from "@t4g/service/middleware";
import { transactionsDAO, Transaction } from "@t4g/service/data";
import { BlockchainMethod } from "@t4g/types";
import * as Sentry from "@sentry/nextjs";

export const serviceBlockchainRPC = {
  getTransactionStatus,
  sendRedeemBonus,
  sendApproveRequestFor,
  sendGrantRoleFor,
  sendBookServiceFor,
  sendCancelDealAsBuyerFor,
  sendCancelDealAsProviderFor,
  sendValidateDealAsBuyerFor,
  sendValidateDealAsProviderFor,
  sendCreateServiceFor,
  sendUpdateServiceFor,
  listRegisteredServices,
};

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  network: process.env.ALCHEMY_NETWORK!,
});
const etherSigner = new ethers.Wallet(
  process.env.PRIVATE_KEY!,
  new ethers.providers.AlchemyProvider(
    getNetwork(parseInt(process.env.CHAIN_ID!)),
    process.env.ALCHEMY_API_KEY
  )
);
const forwarderContract = Forwarder__factory.connect(
  process.env.FORWARDER_CONTRACT!,
  etherSigner
);
const tokenContract = ERC20Meta__factory.connect(
  process.env.TOKEN_CONTRACT!,
  etherSigner
);
const serviceCatalogContract = ServiceCatalog__factory.connect(
  process.env.SERVICE_CATALOG_CONTRACT!,
  etherSigner
);

const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

const types = {
  EIP712Domain,
  ForwardRequest: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "gas", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "data", type: "bytes" },
  ],
};
const domain = {
  name: "MinimalForwarder",
  version: "0.0.1",
  chainId: parseInt(process.env.CHAIN_ID!),
  verifyingContract: process.env.FORWARDER_CONTRACT,
};
const MODULE = "Blockchain-RPC";

async function handleTx(
  method: BlockchainMethod,
  id: string,
  tx: Promise<ContractTransaction>
): Promise<ContractTransaction> {
  return tx
    .then((response) => {
      transactionsDAO.save(response.hash, {
        hash: response.hash,
        from: response.from,
        to: response.to,
        method: method,
        targetId: id,
      } as Transaction);
      const msg = `[${MODULE}][${method}][${id}] sent tx ${response.hash}`;
      logg.info(msg);
      Sentry.captureMessage(msg, "info");
      return response;
    })
    .catch((e) => {
      //immediate errors (before sending to blockchain) like insufficient funds or gas, requests limit, etc
      const msg = `[${MODULE}][${method}][${id}] tx error ${e.toString()}`;
      logg.error(e, msg);
      Sentry.captureMessage(msg, "error");
      Sentry.captureException(e);
      return Promise.reject(e);
    });
}

/**
 * sign transaction with user's hosted wallet
 * @param request
 * @param wallet
 */
function sign(request: Forwarder.ForwardRequestStruct, wallet: ethers.Wallet) {
  return ethSigUtil.signTypedData({
    privateKey: Buffer.from(wallet.privateKey.substring(2, 66), "hex"),
    data: {
      types: types,
      domain: domain,
      primaryType: "ForwardRequest",
      message: request,
    },
    version: ethSigUtil.SignTypedDataVersion.V4,
  });
}

/**
 * MetaTx, T4G admin adress pay fees
 * @param dataField
 */
async function sendForwardedTransaction(
  request: Forwarder.ForwardRequestStruct,
  signature: string
): Promise<ethers.ContractTransaction> {
  return getGasPrice().then((gasPrice) => {
    return forwarderContract.execute(request, signature, {
      gasLimit: 350000,
      gasPrice: gasPrice,
    }).then((tx) => {
        if(process.env.ALCHEMY_NETWORK === "polygon-mumbai") {
            console.log(`tx sent => https://mumbai.polygonscan.com/tx/${tx.hash}`);
        } else {
            console.log(`tx sent => https://polygonscan.com/tx/${tx.hash}`);
        }
        return tx
    });
  });
}

async function getTransactionStatus(
  txHash: string
): Promise<TransactionReceipt | null> {
  return await alchemy.core.getTransactionReceipt(txHash);
}

// services

async function sendBookServiceFor(wallet: Wallet, serviceId: string) {
  const address = wallet.address; //.toLowerCase()
  const service = parseInt(serviceId, 10);
  console.log(`booking service ${service} for user ${address}`);
  return handleTx(
    "buyService",
    serviceId,
    forwarderContract.getNonce(address).then((userNonce) => {
      const approveData = serviceCatalogContract.interface.encodeFunctionData(
        "buyService",
        [service]
      );
      const request = {
        from: wallet.address,
        to: process.env.SERVICE_CATALOG_CONTRACT!,
        value: 0,
        gas: 300000,
        nonce: userNonce.toNumber(),
        data: approveData,
      };
      return sendForwardedTransaction(request, sign(request, wallet));
    })
  );
}

async function sendCancelDealAsBuyerFor(userWallet: Wallet, dealId: string) {
  const address = userWallet.address.toLowerCase();
  const deal = parseInt(dealId, 10);
  console.log(`cancelDealAsBuyer deal ${dealId} as user ${address} `);
  return handleTx(
    "cancelDealAsBuyer",
    dealId,
    forwarderContract.getNonce(address).then((userNonce) => {
      const functionData = serviceCatalogContract.interface.encodeFunctionData(
        "cancelDealAsBuyer",
        [deal]
      );
      const request = {
        from: userWallet.address,
        to: process.env.SERVICE_CATALOG_CONTRACT!,
        value: 0,
        gas: 300000,
        nonce: userNonce.toNumber(),
        data: functionData,
      };
      return sendForwardedTransaction(request, sign(request, userWallet));
    })
  );
}

async function sendCancelDealAsProviderFor(userWallet: Wallet, dealId: string) {
  const deal = parseInt(dealId, 10);
  console.log(
    `cancelDealAsProvider deal ${dealId} as user ${userWallet.address} `
  );
  return handleTx(
    "cancelDealAsProvider",
    dealId,
    forwarderContract.getNonce(userWallet.address).then((userNonce) => {
      const functionData = serviceCatalogContract.interface.encodeFunctionData(
        "cancelDealAsProvider",
        [deal]
      );
      const request = {
        from: userWallet.address,
        to: process.env.SERVICE_CATALOG_CONTRACT!,
        value: 0,
        gas: 300000,
        nonce: userNonce.toNumber(),
        data: functionData,
      };
      return sendForwardedTransaction(request, sign(request, userWallet));
    })
  );
}

async function sendValidateDealAsBuyerFor(
  userWallet: Wallet,
  dealIdStr: string
) {
  const address = userWallet.address.toLowerCase();
  const deal = parseInt(dealIdStr, 10);
  console.log(`validateDealAsBuyer deal ${dealIdStr} as user ${address} `);
  return handleTx(
    "validateDealAsBuyer",
    dealIdStr,
    forwarderContract.getNonce(address).then((userNonce) => {
      const functionData = serviceCatalogContract.interface.encodeFunctionData(
        "validateDealAsBuyer",
        [deal]
      );
      const request = {
        from: userWallet.address,
        to: process.env.SERVICE_CATALOG_CONTRACT!,
        value: 0,
        gas: 300000,
        nonce: userNonce.toNumber(),
        data: functionData,
      };
      return sendForwardedTransaction(request, sign(request, userWallet));
    })
  );
}

async function sendValidateDealAsProviderFor(
  userWallet: Wallet,
  dealId: string
) {
  const address = userWallet.address.toLowerCase();
  const deal = parseInt(dealId, 10);
  console.log(`validateDealAsProvider deal ${dealId} as user ${address} `);
  return handleTx(
    "validateDealAsProvider",
    dealId,
    forwarderContract.getNonce(address).then((userNonce) => {
      const functionData = serviceCatalogContract.interface.encodeFunctionData(
        "validateDealAsProvider",
        [deal]
      );
      const request = {
        from: userWallet.address,
        to: process.env.SERVICE_CATALOG_CONTRACT!,
        value: 0,
        gas: 300000,
        nonce: userNonce.toNumber(),
        data: functionData,
      };
      return sendForwardedTransaction(request, sign(request, userWallet));
    })
  );
}

/**
 * as admin, mint tokens for user
 * @param airdrop
 * @param userId
 */
async function sendRedeemBonus(
  walletAddress: string,
  airdrop: number
): Promise<ethers.ContractTransaction> {
  console.log(`redeeming ${airdrop} for user ${walletAddress}`);
  return handleTx(
    "redeemWelcomeBonus",
    walletAddress,
    getGasPrice().then((gasPrice) => {
      return serviceCatalogContract.redeemWelcomeBonus(
        walletAddress,
        ethers.utils.parseUnits(airdrop.toString()),
        {
          gasLimit: 300000,
          gasPrice: gasPrice,
        }
      );
    })
  );
}

/**
 * As admin, grant role to user
 * @param userId
 * @param role
 */
async function sendGrantRoleFor(
  walletAddress: string,
  role: string
): Promise<ethers.ContractTransaction> {
  //TODO : check if role is already assigned
  const roleCode = getRoleCode(role);
  return serviceCatalogContract
    .hasRole(roleCode, walletAddress)
    .then((hasRole) => {
      if (!hasRole) {
        console.log(
          `grant role ${role} on user $${walletAddress} (roleCode ${roleCode})`
        );
        return handleTx(
          "grantRole",
          walletAddress,
          getGasPrice().then((gasPrice) => {
            return serviceCatalogContract.grantRole(roleCode, walletAddress, {
              gasLimit: 300000,
              gasPrice: gasPrice,
            });
          })
        );
      } else {
        //set response as OK
        return Promise.resolve({
          //     to: string;
          //     from: string;
          //     contractAddress: string,
          //     transactionIndex: number,
          //     root?: string,
          //     gasUsed: BigNumber,
          //     logsBloom: string,
          //     blockHash: string,
          //     transactionHash: string,
          //     logs: Array<Log>,
          //     blockNumber: number,
          //     confirmations: number,
          //     cumulativeGasUsed: BigNumber,
          //     effectiveGasPrice: BigNumber,
          //     byzantium: boolean,
          //     type: number;
          //     status?: number
        } as ethers.ContractTransaction);
      }
    });
}

/**
 * Authorize (allowance) ServiceCatalog to do operations on user's T4G tokens
 * @param userId
 */
async function sendApproveRequestFor(
  userWallet: Wallet
): Promise<ethers.ContractTransaction> {
  return handleTx(
    "approve",
    userWallet.address,
    serviceMiddleware.getUserNonce(userWallet.address).then((userNonce) => {
      const approveData = tokenContract.interface.encodeFunctionData(
        "approve",
        [process.env.SERVICE_CATALOG_CONTRACT!, ethers.constants.MaxUint256]
      );
      const request = {
        from: userWallet.address,
        to: process.env.TOKEN_CONTRACT!,
        value: 0,
        gas: 300000,
        nonce: userNonce,
        data: approveData,
      };
      return sendForwardedTransaction(request, sign(request, userWallet));
    })
  );
}

async function sendCreateServiceFor(
  userWallet: Wallet,
  name: string,
  userId: string,
  buyerRole: string,
  price: BigNumber,
  supply: BigNumber,
  enabled: boolean,
  buyerCanCancel: boolean,
  providerCanCancel: boolean,
  buyerCanValidate: boolean,
  providerCanValidate: boolean
) {
  console.log(`create service '${name}' by provider ${userWallet.address}`);
  const roleCode = getRoleCode(buyerRole);
  const spply = supply.eq(BigNumber.from(0))
    ? ethers.constants.MaxUint256
    : supply;
  return handleTx(
    "createService",
    "",
    getGasPrice().then((gasPrice) => {
      return serviceCatalogContract.createService(
        name,
        userWallet.address,
        roleCode,
        price,
        spply,
        enabled,
        buyerCanCancel,
        providerCanCancel,
        buyerCanValidate,
        providerCanValidate,
        { gasLimit: 300000, gasPrice: gasPrice }
      );
    })
  );
}

async function sendUpdateServiceFor(
  serviceId: number,
  price: BigNumber,
  supply: BigNumber
) {
  const spply = supply.eq(BigNumber.from(0))
    ? ethers.constants.MaxUint256
    : supply;
  return handleTx(
    "updateService",
    serviceId.toString(),
    serviceCatalogContract.updateService(serviceId, price, spply, {
      gasLimit: 300000,
    })
  );
}

function getRoleCode(role: string): string {
  let roleCode = "";
  switch (role.toLowerCase()) {
    case "student":
      roleCode = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("STUDENT_ROLE")
      );
      break;
    case "alumni":
      roleCode = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("ALUMNI_ROLE")
      );
      break;
    case "service_provider":
      roleCode = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("SERVICE_PROVIDER_ROLE")
      );
      break;
    case "service_creator":
      roleCode = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("SERVICE_CREATOR_ROLE")
      );
      break;
  }
  return roleCode;
}

function getGasPrice(): Promise<BigNumber> {
  return axios
    .get(
      `${process.env.POLYGONSCAN_API}/api?module=gastracker&action=gasoracle&apikey=${process.env.POLYGONSCAN_API_KEY}`
    )
    .then((res) => {
      const wei = ethers.utils.parseUnits(res.data.result.FastGasPrice, "gwei");
      console.log("gas price from polygonscan", wei.toNumber());
      return wei;
    })
    .catch(() => {
      return serviceCatalogContract.provider.getGasPrice().then((wei) => {
        console.log("gas price from alchemy", wei.toNumber());
        return wei;
      });
    });
}

function listRegisteredServices() {
  return serviceCatalogContract.serviceIds().then((serviceIds) => {
    return Promise.all(
      [...Array(serviceIds.toNumber() - 1).keys()].map((i) => {
        return serviceCatalogContract
          .services(BigNumber.from(i + 1))
          .then((s: ServiceCatalog.ServiceStruct) => {
            return s;
          });
      })
    );
  });
}
