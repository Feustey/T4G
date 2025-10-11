import { ObjectId } from "mongodb";
import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    collection: "fields",
    timestamps: true,
  },
})
export class Field {
  // @prop({ type: () => ObjectId })
  // public id: string;

  @prop({ type: () => String })
  public name!: string;

  @prop({ type: () => String })
  public type: string;

  @prop({ type: () => String })
  public value: string;
}

export const FieldModel = getModelForClass(Field);
