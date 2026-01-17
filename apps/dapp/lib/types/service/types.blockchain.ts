// ------------------------------------
// Types Blockchain
// ------------------------------------

export enum BlockchainActionTypes {}

export type BlockchainAction = {
  type: string;
  error: false;
  payload: Record<string, unknown>;
  meta: Record<string, unknown>;
};

export type BlockchainMethod = 
  | "createService"
  | "createDeal" 
  | "validateDeal"
  | "cancelDeal"
  | "transfer"
  | "buyService"
  | "cancelDealAsBuyer"
  | "cancelDealAsProvider"
  | "validateDealAsBuyer"
  | "validateDealAsProvider"
  | "redeemWelcomeBonus"
  | "grantRole"
  | "approve"
  | "updateService";
