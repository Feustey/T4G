import {
  identitiesDAO,
  notificationsDAO,
  servicesDAO,
  transactionsDAO,
} from "@t4g/service/data";
import { BigNumber, ethers } from "ethers";
import { Transaction } from "@t4g/service/data";
import {
  Alchemy,
  AlchemyMinedTransactionsEventFilter,
  AlchemySubscription,
  AssetTransfersParams,
  Network,
} from "alchemy-sdk";
import { getNetwork, Log } from "@ethersproject/providers";
import {
  ERC20Meta__factory,
  Forwarder__factory,
  ServiceCatalog__factory,
} from "@t4g/service/smartcontracts";
import * as process from "process";
import { EventFilter } from "@ethersproject/contracts/src.ts";
import { dbConnect } from "@t4g/service/data";
import { formatUnits } from "ethers/lib/utils";
import { delay } from "@nomiclabs/hardhat-etherscan/dist/src/etherscan/EtherscanService";
import { serviceBlockchainRPC } from "libs/service/middleware/src/lib/service-blockchain-rpc";
import {
  DealCancelledEvent,
  DealCreatedEvent,
  DealValidatedEvent,
  ServiceCreatedEvent,
} from "typechain-types/contracts/src/ServiceCatalog";
import { serviceNotifications } from "libs/service/middleware/src/lib/service-notifications";

class BlockchainIndexer {
  blockTs: Map<string, number> = new Map();

  constructor() {
    this.init();
  }

  async init() {
    console.log("init past blockchain transactions & events"); //2023-04-07T09:47:50.031+00:00
    try {
      await dbConnect();
      await this.getBalances();
      //listen to new token transfers (=> update balances)
      await this.getTokenTransfers();
      this.alchemy.ws.on(
        {
          address: process.env.TOKEN_CONTRACT,
          topics: Array<string>().concat(
            this.getTopics(this.tokenContract.filters.Transfer())
          ),
        },
        (log, _) => this.onTransfer
      );
      // listen to txs
      this.getTransactions();
      this.alchemy.ws.on(
        {
          method: AlchemySubscription.MINED_TRANSACTIONS,
          addresses: [{ to: process.env.FORWARDER_CONTRACT }],
        } as AlchemyMinedTransactionsEventFilter,
        (tx) => {
          transactionsDAO
            .save(tx.transaction.hash, {
              block: tx.transaction.blockNumber,
              from: tx.transaction.from,
              to: tx.transaction.to,
              hash: tx.transaction.hash,
            })
            .then(() => {
              console.log(
                `new tx mined from ${tx.transaction.from} to ${tx.transaction.to}`,
                tx.transaction.hash
              );
              return this.enrichTransaction(tx.transaction.hash).then(() => {
                //update events
                return this.getTokenTransfers().then(() => this.getEvents());
              });
            });
        }
      );
      //listen to new events
      this.getEvents();
      //handle services not registered on blockchain
      this.registerServices();
    } catch (e) {
      console.log("error initing " + e);
    }
  }

  alchemy = new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: process.env.ALCHEMY_NETWORK as Network,
  });
  etherSigner = new ethers.Wallet(
    process.env.PRIVATE_KEY!,
    new ethers.providers.AlchemyProvider(
      getNetwork(parseInt(process.env.CHAIN_ID!)),
      process.env.ALCHEMY_API_KEY
    )
  );
  serviceContract = ServiceCatalog__factory.connect(
    process.env.SERVICE_CATALOG_CONTRACT!,
    this.etherSigner
  );
  tokenContract = ERC20Meta__factory.connect(
    process.env.TOKEN_CONTRACT!,
    this.etherSigner
  );
  forwarderContract = Forwarder__factory.connect(
    process.env.FORWARDER_CONTRACT!,
    this.etherSigner
  );

  blocks: Record<number, number> = {};
  maxBlock: number | undefined = undefined;

  getTopics(filter: EventFilter): string[] {
    return (
      filter.topics?.reduce<string[]>((prev, curr, i, acc) => {
        if (typeof curr === "string") {
          prev.push(curr);
        } else {
          curr.forEach((t) => prev.push(t));
        }
        return prev;
      }, Array<string>(0)) || Array<string>(0)
    );
  }

  async nextBlock(b: number): Promise<number> {
    await delay(100);
    if (!this.maxBlock)
      this.maxBlock = (await this.alchemy.core.getBlock("latest")).number;
    return (
      this.blocks[b] ||
      this.alchemy.core
        .getBlock(b)
        .then((bb) => {
          this.blocks[b] = bb.number;
          return Promise.resolve(bb.number);
        })
        .catch(() => {
          if (b >= this.maxBlock!) {
            this.blocks[b] = this.maxBlock!;
            return Promise.resolve(this.maxBlock!);
          }
          console.log("block " + b + " not found, looking next");
          return this.nextBlock(b + 1).then((f) => {
            this.blocks[b] = f;
            return Promise.resolve(f);
          });
        })
    );
  }

  async getBlockTs(block: string): Promise<number> {
    if (this.blockTs.has(block))
      return Promise.resolve(this.blockTs.get(block) || 0);
    else
      return this.alchemy.core.getBlock(block.toString()).then((b) => {
        console.log("getBlock " + block);
        this.blockTs.set(block, b.timestamp);
        delay(200);
        return b.timestamp;
      });
  }

  /**
   * repair services (not registered onchain)
   */
  async registerServices() {
    // const bcServices = await serviceBlockchainRPC.listRegisteredServices()
    // bcServices.forEach((s)=> {
    //   console.log(`blockchain service #${s.serviceId} (${s.provider}) : ${s.name} `)
    // })
    const services = await servicesDAO.getAll({ txHash: { $exists: false } });
    if (services.length == 0) return;
    console.log(`registering ${services.length} services`);
    for (const svc of services) {
      console.log("registering service", svc);
      identitiesDAO
        .getById(svc.serviceProvider)
        .then((provider) => {
          if (!provider) return;
          const providerCanCancel = svc.audience == "ALUMNI";
          const providerCanValidate = svc.audience == "ALUMNI";
          const buyerCanValidate = svc.audience == "STUDENT";
          let supply = ethers.constants.MaxUint256;
          if (svc.totalSupply)
            supply = ethers.utils.parseUnits(svc.totalSupply.toString());
          ethers.Wallet.fromEncryptedJson(
            provider.encryptedWallet,
            process.env.WALLET_ENCRYPTION_PASS || "password"
          ).then((wallet) => {
            return serviceBlockchainRPC
              .sendCreateServiceFor(
                wallet,
                svc.name,
                provider._id,
                svc.audience.toLowerCase(),
                ethers.utils.parseUnits(svc.price.toString()),
                supply,
                true,
                true,
                providerCanCancel,
                buyerCanValidate,
                providerCanValidate
              )
              .then((tx) => {
                console.log(`tx submitted ${tx.hash}`);
                return servicesDAO.update(svc._id, { txHash: tx.hash });
              });
          });
        })
        .catch((e) => {
          console.error("error processing service", svc, e);
        });
    }
    await this.getEvents();
  }

  /**
   * init balances from blockchain
   */
  async getBalances() {
    return identitiesDAO.getAll().then((users) => {
      let p = Promise.resolve(); // Q() in q
      users.forEach((u) => {
        const walletAddres = u.wallet?.address;
        if (walletAddres) {
          p = p.then(() =>
            this.getBalance(walletAddres.toLowerCase()).then(() => delay(1000))
          );
          return p;
        } else {
          console.warn("no wallet for user " + u._id);
          return Promise.resolve();
        }
      });
      return p;
    });
  }

  /**
   * Refresh balance from blockchain
   * @param wallet address
   */
  async getBalance(wallet: string) {
    console.log("updating balance for wallet " + wallet);
    if (!wallet) return;
    await delay(100);
    return this.alchemy.core
      .getTokenBalances(wallet, [process.env.TOKEN_CONTRACT!.toLowerCase()])
      .then((res) => res.tokenBalances[0].tokenBalance)
      .then((raw) => parseInt(formatUnits(BigNumber.from(raw), 18)))
      .then((n) => {
        return identitiesDAO.getByWallet(wallet).then((u) => {
          if (u) {
            if (u.wallet.balance != n) {
              identitiesDAO.update(u._id, {
                wallet: {
                  ...u.wallet,
                  balance: n,
                  address: wallet,
                },
              });
              console.log(`updated balance ${n} for wallet ${wallet}`);
            } else {
              console.log(
                `(already) updated balance ${n} for wallet ${wallet}`
              );
            }
            return Promise.resolve(n);
          } else {
            console.warn(
              `can't update balance ${n} for wallet ${wallet}: user not found`
            );
            return Promise.resolve(0);
          }
        });
      })
      .catch((e) => {
        console.warn("error on getUserBalance for address " + e);
        return 0;
      });
  }

  /**
   * get T4G tokens transfers from blockchain, store them in DB/transfers
   */
  async getTokenTransfers() {
    console.log("getting transfers");
    transactionsDAO
      .getLastBlock({ transferAmount: { $exists: true } })
      .then((b) => {
        this.nextBlock(b || 0).then((next) => {
          const lastTransferBlock = BigNumber.from(next)?.toHexString() || "0";
          this.alchemy.core
            .getLogs({
              address: process.env.TOKEN_CONTRACT,
              topics: [
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", //ERC20 transfer
              ],
              fromBlock: lastTransferBlock,
            })
            .then((res) => {
              res.map((log) => {
                this.onTransfer(log);
              });
              if (res.length > 0)
                console.log(`inserted ${res.length} transfers`);
            });
        });
      });
  }

  /**
   * get T4G transactions from blockchain, store them in DB/transactions
   */
  async getTransactions() {
    transactionsDAO
      .getLastBlock({ to: process.env.FORWARDER_CONTRACT!.toLowerCase() })
      .then((b) => {
        this.nextBlock(b || 0).then((next) => {
          const lastTransactionBlock =
            BigNumber.from(next)?.toHexString() || "0";
          this.alchemy.core
            .getAssetTransfers({
              toAddress: process.env.FORWARDER_CONTRACT!,
              fromBlock: lastTransactionBlock,
              category: ["external", "erc20", "erc721", "erc1155"],
              excludeZeroValue: false,
            } as AssetTransfersParams)
            .then((res) =>
              res.transfers.map((tx) => {
                return {
                  hash: tx.hash,
                  block: BigNumber.from(tx.blockNum).toNumber(),
                  from: tx.from.toLowerCase(),
                  to: tx.to?.toLowerCase(),
                } as Transaction;
              })
            )
            .then((ts) => {
              if (ts.length > 0) {
                ts.forEach((t) => {
                  transactionsDAO.save(t.hash, t);
                });
                console.log("inserted " + ts.length + " new T4G txs");
              }
            });
        });
      })
      .then(() => {
        transactionsDAO
          .getAll({ ts: { $exists: false } })
          .then((undatedTxs) => {
            // delay(10 * 1000).then(() => {
            if (undatedTxs.length > 0) {
              console.log(`update ts for ${undatedTxs.length} txs`);
              let p = Promise.resolve(); // Q() in q
              undatedTxs.forEach(
                (tx) =>
                  (p = p
                    .then(() => this.enrichTransaction(tx.hash))
                    .then(() => delay(1000))
                    .catch((e) => {
                      console.log("error enriching tx", tx.hash, e);
                      Promise.resolve();
                    }))
              );
              return p;
            } else return Promise.resolve();
          });
      });
  }

  /**
   * enrich transaction record with receipt
   */
  async enrichTransaction(tx: string) {
    console.log("get receipt for tx ", tx);
    return this.alchemy.core
      .getTransactionReceipt(tx)
      .then((receipt) => {
        if (receipt) {
          console.log("get block " + receipt.blockNumber);
          return this.alchemy.core
            .getBlock(receipt.blockHash)
            .then((block) => {
              const ts = new Date(block.timestamp * 1000);
              transactionsDAO.save(tx, { ts });
              return notificationsDAO.updateTxTimestamp(tx, ts).then(() => {
                console.log("... receipt ok", tx);
                return Promise.resolve(ts);
              });
            })
            .catch((e) => {
              console.log("error on block", e, receipt?.blockHash);
              return Promise.reject("error on block");
            });
        } else {
          console.warn("no receipt for tx", tx);
          return Promise.resolve(undefined);
        }
      })
      .catch((e) => {
        console.log("error on receipt", e, tx);
        return Promise.reject("error on receipt");
      });
  }

  /**
   * get T4G events from blockchain, store them in DB/events :
   * - Deal created (pending)
   * - Deal cancelled
   * - Deal approved
   * - Service created
   */
  async getEvents() {
    console.log("get new events...");
    transactionsDAO.getLastBlock({ event: "DealCreated" }).then((b) => {
      const lastEventBlock = BigNumber.from(b || 0).toNumber();
      this.serviceContract
        .queryFilter(this.serviceContract.filters.DealCreated(), lastEventBlock)
        .then((ev) => {
          let count = 0;
          ev.filter((e) => e.blockNumber > lastEventBlock).forEach((t) => {
            this.onDealCreated(t);
            count++;
          });
          if (count)
            console.log("inserted " + count + " new T4G created events");
        });
    });
    transactionsDAO.getLastBlock({ event: "DealValidated" }).then((b) => {
      this.nextBlock(b || 0).then((next) => {
        const lastEventBlock = BigNumber.from(next).toNumber();
        this.serviceContract
          .queryFilter(
            this.serviceContract.filters.DealValidated(),
            lastEventBlock
          )
          .then((ev) => {
            let count = 0;
            ev.filter((e) => e.blockNumber > lastEventBlock).forEach((t) => {
              this.onDealValidated(t);
              count++;
            });
            if (count)
              console.log("inserted " + count + " new T4G validated events");
          });
      });
    });
    transactionsDAO.getLastBlock({ event: "DealCancelled" }).then((b) => {
      const lastEventBlock = BigNumber.from(b || 0).toNumber();
      this.serviceContract
        .queryFilter(
          this.serviceContract.filters.DealCancelled(),
          lastEventBlock
        )
        .then((ev) => {
          let count = 0;
          ev.filter((e) => e.blockNumber > lastEventBlock).forEach((t) => {
            this.onDealCancelled(t);
            count++;
          });
          if (count)
            console.log("inserted " + count + " new T4G cancelled events");
        });
    });
    //get service created
    servicesDAO
      .getAll({ blockchainId: { $eq: null }, txHash: { $ne: null } })
      .then((evs) => {
        if (evs.length > 0) {
          console.log("looking blockchain ids for services", evs);
          this.serviceContract
            .queryFilter(this.serviceContract.filters.ServiceCreated(), 0)
            .then((logs) => {
              logs.forEach((l) => {
                this.onServiceCreated(l);
              });
            });
        }
      });
  }

  async onTransfer(log: Log) {
    const hash = log.transactionHash;
    console.log("onTransfer", hash);
    const from = "0x" + log.topics[1].substring(26).toLowerCase();
    const to = "0x" + log.topics[2].substring(26).toLowerCase();
    const amount = parseInt(ethers.utils.formatUnits(log.data, 18));
    return transactionsDAO
      .save(log.transactionHash, {
        transferFrom: from,
        transferTo: to,
        transferAmount: amount,
        block: log.blockNumber,
      })
      .then(() => {
        return this.enrichTransaction(log.transactionHash);
      })
      .then(() => {
        if (from == "0x0000000000000000000000000000000000000000") {
          return serviceNotifications
            .sendNotificationForAirdrop(hash, to, amount)
            .catch((e) => {
              console.warn("onTransfer error: ", e);
            })
            .then(() => {
              return this.getBalance(to);
            });
        } else {
          return this.getBalance(to).then(() => this.getBalance(from));
        }
      })
      .catch((e) => {
        console.warn("onTransfer error", e);
        Promise.reject(e);
      });
  }

  async onDealCreated(t: DealCreatedEvent) {
    console.log("onDealCreated", t);
    const dealId = t.args.dealId.toNumber();
    const serviceBlockchainId = t.args.serviceId.toNumber();
    const buyer = t.args.buyer.toLowerCase();
    const provider = t.args.provider.toLowerCase();
    return transactionsDAO
      .save(t.transactionHash, {
        event: "DealCreated",
        dealId: dealId,
        serviceId: serviceBlockchainId,
        serviceBuyer: buyer,
        serviceProvider: provider,
      })
      .then(() => {
        console.log("onDealCreated Notif");
        return serviceNotifications
          .sendNotificationForServiceBooked(
            t.transactionHash,
            buyer,
            provider,
            serviceBlockchainId.toString()
          )
          .then(() => {
            this.getBalance(buyer);
            this.getBalance(provider);
          })
          .catch((e) => {
            console.warn("onDealCreated error: ", e);
          });
      });
  }

  async onDealValidated(t: DealValidatedEvent) {
    const dealId = t.args.dealId.toNumber();
    const serviceBlockchainId = t.args.serviceId.toNumber();
    const buyer = t.args.buyer.toLowerCase();
    const provider = t.args.provider.toLowerCase();
    return transactionsDAO
      .save(t.transactionHash, {
        event: "DealValidated",
        dealId: dealId,
        serviceId: serviceBlockchainId,
        serviceBuyer: buyer,
        serviceProvider: provider,
      })
      .then(() => {
        serviceNotifications
          .sendNotificationForServiceValidated(
            t.transactionHash,
            buyer,
            provider,
            serviceBlockchainId.toString()
          )
          .then(() => {
            this.getBalance(buyer);
            this.getBalance(provider);
          })
          .catch((e) => {
            console.warn("onDealValidated error", e);
          });
      });
  }

  async onDealCancelled(t: DealCancelledEvent) {
    const dealId = t.args.dealId.toNumber();
    const serviceBlockchainId = t.args.serviceId.toNumber();
    const buyer = t.args.buyer.toLowerCase();
    const provider = t.args.provider.toLowerCase();
    return transactionsDAO
      .save(t.transactionHash, {
        event: "DealCancelled",
        dealId: dealId,
        serviceId: serviceBlockchainId,
        serviceBuyer: buyer,
        serviceProvider: provider,
      })
      .then(() => {
        serviceNotifications
          .sendNotificationForServiceCancelled(
            t.transactionHash,
            buyer,
            provider,
            serviceBlockchainId.toString()
          )
          .then(() => {
            this.getBalance(buyer);
            this.getBalance(provider);
          })
          .catch((e) => {
            console.warn("onDealCancelled error", e);
            Promise.resolve();
          });
      });
  }

  async onServiceCreated(l: ServiceCreatedEvent) {
    return servicesDAO.getAll({ txHash: l.transactionHash }).then((svcs) => {
      return Promise.all(
        svcs.map((svc) => {
          return servicesDAO
            .update(svc._id, {
              blockchainId: l.args.serviceId.toNumber(),
            })
            .then((res) => {
              console.log(
                `${res.modifiedCount} service ${svc._id} created on blockchain: ${l.args.serviceId} `
              );
            })
            .catch((e) => {
              console.warn("onServiceCreated error", e);
            });
        })
      );
    });
  }
}

const interval = 10;

// const globalForIndexer = global as unknown as { indexer: BlockchainIndexer }

//export const indexer = globalForIndexer.indexer || new BlockchainIndexer()

//if (process.env.NODE_ENV === 'production') globalForIndexer.indexer = indexer

export const serviceBlockchainIndexer = {
  BlockchainIndexer,
};
