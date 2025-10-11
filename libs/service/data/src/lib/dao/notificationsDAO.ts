import {
  Identity,
  Notification,
  NotificationModel,
} from "@t4g/service/data";
import { ObjectId, UpdateResult, DeleteResult } from "mongodb";
import { FilterQuery } from "mongoose";

export const notificationsDAO = {
  // getAll,
  // getById,
  create,
  getByUser,
  updateTxTimestamp,
};

async function setSentDate(tx: string, sentDate: Date) {
  return await NotificationModel.updateOne({ tx: tx }, { sent: sentDate });
}

// async function getAll(): Promise<Notification[]> {
//   return NotificationModel.find().lean();
// }

// async function getById(id: string): Promise<Notification | null> {
//   return NotificationModel.findOne({ id: new ObjectId(id) }).lean();
// }
async function getByUser(user: string): Promise<Notification[]> {
  return NotificationModel.find({ user: new ObjectId(user) })
    .sort({ ts: -1 })
    .lean();
}

async function create(
  _entity: Partial<Notification>
): Promise<Notification | null> {
  const found = await NotificationModel.findOne({
    tx: _entity.tx,
    user: _entity.user,
  });
  if (!found) return NotificationModel.create(_entity);
  else return null;
}

async function updateTxTimestamp(
  txHash: string,
  ts: Date
): Promise<UpdateResult> {
  return NotificationModel.updateMany({ tx: txHash }, { ts });
}
