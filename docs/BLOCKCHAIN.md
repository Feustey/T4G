# Blockchain architecture

## Smart contracts

T4G use 3 smart contracts:

- [`tokens` contract](./contracts/src/ERC20Meta.sol) : T4G tokens management
- [`services catalog` contract](./contracts/src/ServiceCatalog.sol) : service registration and booking
- [`forwarder` contract](./contracts/src/Forwarder.sol) : pay transactions fees on behalf as the user ([meta-transactions](https://wiki.polygon.technology/docs/develop/meta-transactions/meta-transactions/))

## Indexer (read)

T4G use a [daemon](./apps/daemon) application
to listen to blockchain events via an [indexer service](./libs/service/middleware/src/lib/service-blockchain-indexer.ts).

The daemon listen to :

- `WelcomeBonusReceived` event on `services catalog` contract: => update welcome bonus fields in **identities** db table
- token transfers on `tokens` contract => update **Transfers** db table + update balances **identities** db table
  (to & from in transfer)
- transactions (on `forwarder` contract) => update **transactions** db table
- deal related events (`DealCreated`, `DealCancelled`, `DealValidated` ) on `services catalog` contract => update
  **events** db table
- `ServiceCreated` on `services catalog` contract => update blockchainId field on **services** db table

## RPC (write)

T4G use a [RPC gateway](./libs/service/middleware/src/lib/service-blockchain-rpc.ts) to send
transaction, direct or through `forwarder` contract for [meta-transactions](https://wiki.polygon.technology/docs/develop/meta-transactions/meta-transactions/)
(T4G pay transactions fees for user).

Methods available:

- `getTransactionStatus` to get result (fail/success) for a transaction sent
- `redeemBonus` when user onboard (step #1), mint tokens for the new user (20 for alumnis, 100 for students) on `tokens` contract
- `grantRoleFunction` when user onboard (step #2), set role (student/alumni/admin) for user in `services catalog` contract
- `approveRequest` (MetaTx) when user onboard (step #3), allow `services catalog` contract to act on T4G user tokens in `tokens` contract (ex: transfer token when a service is booked)
- `createServiceFunction` create/register a new service in `services catalog` contract
- `updateServiceFunction` update service (id, price and/or supply) in `services catalog` contract
- `bookService` (MetaTx) book service for a user
- `validateDealFunction` (MetaTx) validate deal (service booking) as a user/consumer
- `validateDealAsProviderFunction` (MetaTx) validate deal (service booking) as a user/provider
- `cancelDealAsBuyerFunction` (MetaTx) cancel deal (service booking) as a user/consumer
- `cancelDealAsProviderFunction` (MetaTx) cancel deal (service booking) as a user/provider
