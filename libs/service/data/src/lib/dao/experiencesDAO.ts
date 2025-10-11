import { ObjectId, UpdateResult, DeleteResult } from "mongodb";
import { Experience, ExperienceModel, Identity } from "@t4g/service/data";
import { Api } from "@t4g/types";
import { FilterQuery } from "mongoose";

export const experiencesDAO = {
  getAll,
  getById,
  create,
  update,
  getByUser,
  delete: _delete,
};

async function getAll(
  filter: FilterQuery<Identity> = {}
): Promise<Api.Experience[]> {
  return ExperienceModel.find(filter)
    .sort({ from: -1 })
    .lean()
    .then((res) => {
      return res.map((r) => {
        return toExperience(r);
      });
    });
}

async function getByUser(userId: string): Promise<Api.Experience[]> {
  return getAll({ userId: userId });
}

async function getById(id: string): Promise<Api.Experience> {
  return ExperienceModel.findOne({
    _id: new ObjectId(id),
  })
    .lean()
    .then((xp) => {
      if (xp) {
        return toExperience(xp);
      } else {
        return Promise.reject();
      }
    });
}

async function create(entity: Partial<NewExperience>): Promise<Api.Experience> {
  console.log("NewExperience", entity);
  return ExperienceModel.create(entity).then(toExperience);
}

async function update(
  id: string,
  _entity: Partial<Experience>
): Promise<UpdateResult> {
  const params = _entity;
  return ExperienceModel.updateOne({ _id: new ObjectId(id) }, params);
}

async function _delete(id: string): Promise<DeleteResult> {
  return ExperienceModel.deleteOne({ _id: new ObjectId(id) });
}

function toExperience(xp: Experience): Api.Experience {
  return {
    ...xp,
    id: xp._id,
  };
}

export type NewExperience = Omit<Experience, "_id">;
