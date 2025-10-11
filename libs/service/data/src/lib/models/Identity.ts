import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { Components } from "@t4g/types";

class Preferences {
  @prop({ type: String, required: true, default: [] })
  serviceCategories!: Array<string>; //services categories (==annotation) proposed in 'Mentoring' by alumni

  @prop({ type: String, required: true, default: [] })
  recommendedServices!: Array<string>; //TODO meaning ?
}

export class Wallet {
  @prop({ type: () => String })
  address!: string;

  @prop({ type: () => Number })
  balance: number;
}

@modelOptions({
  schemaOptions: {
    collection: "identities",
    timestamps: true,
  },
})
export class Identity {
  // @prop({ type: () => ObjectId })
  // public id: string;
  readonly _id: string;

  @prop({
    type: () => String,
    lowercase: true,
    required: [true, "Email is required!"],
    unique: true,
  })
  public email!: string;

  // @prop({ type: () => String })
  // public id: string;

  // @prop({ type: () => ObjectId })
  // public id: string;

  @prop({ type: () => String })
  public avatar: string;

  @prop({ type: () => String })
  public dateCreated: string;

  @prop({ type: () => String })
  public dateUpdated: string;

  @prop({ type: () => String })
  public firstname!: string;

  @prop({ type: () => String })
  public lastname!: string;

  @prop({ type: () => String })
  public role: Components.UserRole;

  @prop({ type: () => Boolean, default: false })
  public isOnboarded: boolean;

  @prop({ type: () => String })
  public program: string;

  @prop({ type: () => String })
  public graduatedYear: string;

  @prop({ type: () => String })
  public topic: string;

  @prop({ type: () => String })
  public school: string;

  @prop({ type: () => Number })
  public airdrop: number;

  @prop({ type: () => String })
  public encryptedWallet: string;

  @prop({ type: () => String })
  public about: string;

  @prop({ type: () => String })
  public recommendedServices!: Array<string>; //TODO meaning ?

  @prop({ type: () => Wallet })
  public wallet: Wallet;

  @prop({ type: () => Boolean, default: true })
  public firstDashboardAccess: boolean;

  @prop({ type: () => Number, default: 0 })
  public dashboardAccessCount: number;

  @prop({ type: () => Number, default: 0 })
  public welcomeBonusAmount: number;

  @prop({ type: () => Date })
  public welcomeBonusDate: Date;

  @prop({ type: () => String })
  public welcomeBonusTx: string;

  @prop({ type: String, required: true, default: [] })
  public proposedServices: string[]; //ids of services

  @prop({ type: String, required: true, default: [] })
  public preferredCategories: string[]; //ids of categories

  // public get name() {
  //   return `${this.firstname} ${this.lastname}`;
  // }
}

export const IdentityModel = getModelForClass(Identity);
