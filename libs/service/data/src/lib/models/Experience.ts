import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";

@modelOptions({
  schemaOptions: {
    collection: "experiences",
  },
})
export class Experience {
  readonly _id: string;

  @prop({ type: () => String })
  readonly userId: string;

  @prop({ type: () => String })
  title: string;

  @prop({ type: () => String })
  company: string;

  @prop({ type: () => String })
  city: string;

  @prop({ type: () => String })
  country: string;

  @prop({ type: () => String })
  role: string;

  @prop({ type: () => String })
  industry: string;

  @prop({ type: () => Date })
  from: Date;

  @prop({ type: () => Date })
  to?: Date;

  @prop({ type: () => Boolean })
  isCurrent: boolean;
}

export const ExperienceModel = getModelForClass(Experience);
