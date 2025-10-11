import { Common } from "@t4g/types";
import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    collection: "services",
  },
})
export class DbService {
  // @prop({ type: () => ObjectId })
  // public id: string;
  readonly _id: string;

  // /**
  //  * TODO kind ?
  //  */
  // @prop({ type: () => String })
  // public kind: string;
  //
  @prop({ type: () => Number })
  public price: number;

  @prop({ type: () => String })
  public name: string;

  @prop({ type: () => String })
  public unit: string;

  @prop({ type: () => String })
  public description: string;

  // @prop({ type: () => String })
  // public serviceProviderName: string;

  @prop({ type: () => String })
  public avatar: string;

  @prop({ type: () => String })
  public summary: string;

  // @prop({ type: () => Number })
  // public cost: number;

  @prop({ type: () => Number })
  public totalSupply: number;

  @prop({ type: () => Number })
  public rating: number[];

  @prop({ type: () => Boolean })
  public suggestion: boolean;

  @prop({ type: () => Number })
  public blockchainId: number;

  @prop({ type: () => String })
  public txHash: string;

  @prop({
    type: () => String,
    // enum: Common.PROVIDER_TYPES,
    required: true,
    default: "SERVICE_PROVIDER",
  })
  public audience!: Common.ROLE_TYPE;

  @prop({ type: () => String })
  public category: string;

  @prop({ type: () => String })
  public serviceProvider: string; //user id

  @prop({ type: () => String })
  public annotations: string[];

  // @prop({ ref: () => Identity })
  // public serviceProvider: Ref<Identity>;
  //
  // @prop({ ref: () => Annotation })
  // public annotations: Ref<Annotation>[];
}

export const ServiceModel = getModelForClass(DbService);
