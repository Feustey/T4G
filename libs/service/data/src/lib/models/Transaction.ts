import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { BlockchainExport } from "@t4g/types";

type BlockchainMethod = BlockchainExport.BlockchainMethod;

@modelOptions({
  schemaOptions: {
    collection: "bc_transactions",
    timestamps: false,
  },
})
export class Transaction {
  @prop({ type: () => String })
  public hash: string;

  @prop({ type: () => Number })
  public block: number | undefined;

  @prop({ type: () => Date })
  public ts: Date;

  @prop({ type: () => String })
  public from: string;

  @prop({ type: () => String })
  public to: string;

  @prop({ type: () => String })
  public method: BlockchainMethod;

  @prop({ type: () => String })
  public event: "DealCreated" | "DealValidated" | "DealCancelled";

  /**
   * id of service, deal or user, depends on methods called
   */
  @prop({ type: () => String })
  public targetId: string | undefined;

  /**
   * related T4G transfer, if any
   */
  @prop({ type: () => String })
  public transferFrom: string | undefined;

  @prop({ type: () => String })
  public transferTo: string | undefined;

  @prop({ type: () => Number })
  public transferAmount: number | undefined;

  /**
   * related service, if any
   */
  @prop({ type: () => Number })
  public dealId: number | undefined;

  @prop({ type: () => Number })
  public serviceId: number | undefined;

  @prop({ type: () => String })
  public serviceBuyer: string | undefined;

  @prop({ type: () => String })
  public serviceProvider: string | undefined;
}

export const TransactionModel = getModelForClass(Transaction);
