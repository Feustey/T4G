import { Common } from "@t4g/types";
import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    collection: "servicecategories",
  },
})
export class ServiceCategory {
  // @prop({ type: () => ObjectId })
  // public id: ObjectId;
  readonly _id: string;

  @prop({ type: () => String })
  public name!: string;

  @prop({ type: () => String })
  public kind: string;

  @prop({ type: () => String })
  public description: string;

  @prop({ type: () => String })
  public href: string;

  @prop({ type: () => Number })
  public defaultPrice: number;

  @prop({ type: () => String })
  public defaultUnit: string;

  @prop({ type: () => String })
  public icon: string;

  @prop({ type: () => Boolean, default: false })
  public disabled: boolean;

  @prop({
    type: () => String,
    default: "SERVICE_PROVIDER",
  })
  public serviceProviderType: Common.ROLE_TYPE;

  @prop({
    type: () => String,
    required: true,
    default: "ALUMNI",
  })
  public audience: Common.ROLE_TYPE;
}

export const ServiceCategoryModel = getModelForClass(ServiceCategory);
