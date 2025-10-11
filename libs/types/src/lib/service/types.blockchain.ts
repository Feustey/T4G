// ------------------------------------
// Namespace Service.Blockchain
// ------------------------------------
export namespace Blockchain {
  export namespace Enum {
    export enum ActionTypes {}
  }

  export namespace Type {
    export type ACTION = {
      type: string;
      error: false;
      payload: Record<string, unknown>;
      meta: Record<string, unknown>;
    };
  }
}

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
