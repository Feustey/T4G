import {
  prop,
  getModelForClass,
  Ref,
  modelOptions,
} from "@typegoose/typegoose";
import { Identity } from "./Identity";
import { ObjectId } from "mongodb";
import { Components } from "@t4g/types";

@modelOptions({
  schemaOptions: {
    collection: "notifications",
    timestamps: true,
  },
})
export class Notification {
  // @prop({ type: () => ObjectId })
  // public id: string;
  readonly id: string;

  @prop({ type: () => String })
  public tx: string;

  @prop({ type: () => String })
  public user: string;

  // @prop({ type: () => String })
  // public from: string;//public address
  //
  // @prop({ type: () => String })
  // public to: string;//public address

  @prop({ type: () => Number })
  public amount: number;

  @prop({ type: () => String })
  public type: Components.TransactionCode;

  @prop({ type: () => String })
  public message: string;

  @prop({ type: () => String })
  public link: string;

  @prop({ type: () => Date })
  public ts: Date;

  @prop({ type: () => Date })
  public sent: Date;
  // createdAt: Date;
}

export const NotificationModel = getModelForClass(Notification);
