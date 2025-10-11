import * as mongoose from "mongodb";
import { Field, FieldModel } from "@t4g/service/data";
import { DeleteResult, UpdateResult } from "mongodb";

export const serviceFieldsRepo = {
  getAll,
  getById,
  getByIdDetailed,
  create,
  update,
  delete: _delete,
};

async function getAll(): Promise<Field[]> {
  return await FieldModel.find().lean();
}

async function getById(id: string): Promise<Field | null> {
  return await FieldModel.findOne({ id: new mongoose.ObjectId(id) }).lean();
}

async function create(_entity: Partial<Field>): Promise<Field> {
  const entity = _entity;
  return await FieldModel.create(entity);
}

async function update(
  id: string,
  _entity: Partial<Field>
): Promise<UpdateResult> {
  const params = _entity;
  return await FieldModel.updateOne({ id: new mongoose.ObjectId(id) }, params);
}

async function _delete(id: string): Promise<DeleteResult> {
  return await FieldModel.deleteOne({ id: new mongoose.ObjectId(id) });
}

async function getByIdDetailed(id: string): Promise<Field | null> {
  return await FieldModel.findOne({ id: new mongoose.ObjectId(id) })
    .populate("details")
    .lean();
}
