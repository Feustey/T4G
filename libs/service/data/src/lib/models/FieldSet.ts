import { ObjectId } from "mongodb";
import {
  prop,
  getModelForClass,
  modelOptions,
  Ref,
} from "@typegoose/typegoose";
import { Field } from "libs/service/data/src/lib/models/Field";

@modelOptions({
  schemaOptions: {
    collection: "fields",
    timestamps: true,
  },
})
export class FieldSet {
  // @prop({ type: () => ObjectId })
  // public id: string;

  @prop({ type: () => Boolean })
  public isTemplate: boolean;

  @prop({ ref: () => Field })
  public fields: Ref<Field>[];
}

export const FieldSetModel = getModelForClass(FieldSet);
