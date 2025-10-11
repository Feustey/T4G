import * as mongoose from "mongoose";

/**
Source :
https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose/utils/dbConnect.js
**/

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
mongoose.set("debug", process.env.MONGO_DEBUG === "true" ? true : false);
mongoose.set("strictQuery", true);
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

if (!DB_NAME) {
  throw new Error("Please define the DB_NAME environment variable inside .env");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */

interface CustomNodeJsGlobal {
  //extends NodeJS.Global {
  mongoose?: any;
  // You can declare anything you need.
}
declare const global: CustomNodeJsGlobal;
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // bufferCommands: false,
      dbName: DB_NAME,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI || "", opts)
      .then((mongoose) => {
        console.log("connected to MongoDB");
        return mongoose;
      })
      .catch((e) => {
        console.error("error connecting to MongoDB", e);
        throw e;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
